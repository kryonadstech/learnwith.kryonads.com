from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random
from .models import User, OTP
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser

def get_user_data(user, request=None):
    photo_url = None
    if user.profile_photo:
        photo_url = user.profile_photo.url
        if request:
            photo_url = request.build_absolute_uri(photo_url)
    return {
        'email': user.email,
        'full_name': user.full_name,
        'phone_number': user.phone_number,
        'address': user.address,
        'profile_photo': photo_url,
        'is_staff': user.is_staff,
        'is_student': user.is_student
    }

def enforce_single_device(user):
    # DRF Token is a OneToOneField. Deleting it and recreating it invalidates all previous sessions.
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)
    return token.key

class AdminLoginView(views.APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(request, username=email, password=password)
        
        if user and user.is_staff:
            token_key = enforce_single_device(user)
            return Response({
                'token': token_key,
                'user': get_user_data(user, request)
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class RequestOTPView(views.APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, is_student=True, is_active=True)
        except User.DoesNotExist:
            # We don't want to leak whether the user exists, but for an LMS it might be fine.
            # Let's just return success anyway to prevent enumeration, or return a clear error.
            # Returning an error is usually better for UX if they make a typo.
            return Response({'error': 'No active student account found with this email.'}, status=status.HTTP_404_NOT_FOUND)

        code = str(random.randint(100000, 999999))
        
        # Invalidate old OTPs
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)
        
        OTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=10)
        )

        try:
            send_mail(
                'Your LMS Login Code',
                f'Your login code is: {code}. It expires in 10 minutes.',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            # In a real app, log this error
            return Response({'error': 'Failed to send email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent successfully'})

class VerifyOTPView(views.APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, is_student=True, is_active=True)
        except User.DoesNotExist:
            return Response({'error': 'Invalid user'}, status=status.HTTP_404_NOT_FOUND)

        try:
            otp = OTP.objects.get(user=user, code=code, is_used=False)
        except OTP.DoesNotExist:
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)

        if not otp.is_valid():
            return Response({'error': 'Code has expired'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark OTP as used
        otp.is_used = True
        otp.save()

        # Enforce single device by recreating the token
        token_key = enforce_single_device(user)

        return Response({
            'token': token_key,
            'user': get_user_data(user, request)
        })

class MeView(views.APIView):
    def get(self, request):
        return Response(get_user_data(request.user, request))

class UpdateProfileView(views.APIView):
    parser_classes = (MultiPartParser, FormParser)

    def put(self, request):
        user = request.user
        user.full_name = request.data.get('full_name', user.full_name)
        user.phone_number = request.data.get('phone_number', user.phone_number)
        user.address = request.data.get('address', user.address)
        
        if 'profile_photo' in request.FILES:
            user.profile_photo = request.FILES['profile_photo']
            
        user.save()
        return Response(get_user_data(user, request))

class LogoutView(views.APIView):
    def post(self, request):
        # Simply delete the token to log out
        if request.auth:
            request.auth.delete()
        return Response({'message': 'Logged out successfully'})
