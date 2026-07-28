from django.urls import path
from .views import AdminLoginView, RequestOTPView, VerifyOTPView, MeView, LogoutView, UpdateProfileView, InquiryCreateView

urlpatterns = [
    path('auth/admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('auth/student/request-otp/', RequestOTPView.as_view(), name='request-otp'),
    path('auth/student/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/profile/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('inquiry/', InquiryCreateView.as_view(), name='inquiry-create'),
]
