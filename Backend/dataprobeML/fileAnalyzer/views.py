from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser

from .models import Review
from .serializer import ReviewSerializer

# Create your views here.
@csrf_exempt
def reviewApi(request):
    if request.method == 'GET':
        reviews = Review.objects.all()
        reviews_serializer = ReviewSerializer(reviews, many=True)
        return JsonResponse(reviews_serializer.data, safe=False)
    elif request.method == 'POST':
        review_data = JSONParser().parse(request)
        reviews_serializer = ReviewSerializer(data=review_data)
        if reviews_serializer.is_valid():
            reviews_serializer.save()
            return JsonResponse("Added successfully!", safe=False)
        return JsonResponse("Error", safe=False)