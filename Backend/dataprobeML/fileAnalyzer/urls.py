from django.urls import re_path
from fileAnalyzer import views

urlpatterns = [
    re_path(r'^reviews/$', views.reviewApi),
    re_path(r'^reviews/(?P<pk>[0-9]+)$', views.reviewApi),
]