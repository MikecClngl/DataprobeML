from django.urls import re_path
from fileAnalyzer import views

urlpatterns = [
    re_path(r'^reviews/$', views.reviewApi)
]