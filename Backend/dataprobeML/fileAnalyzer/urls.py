from django.urls import re_path, path
from fileAnalyzer import views
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    re_path(r'^reviews/$', views.reviewApi),
    re_path(r'^reviews/(?P<pk>[0-9]+)$', views.reviewApi),
    re_path(r'^register/$', views.register_user, name='register'),
    re_path(r'^login/$', views.login_user, name='login'),
    path('token-auth-test/', views.token_auth_test, name='token_auth_test'),
]