from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
import json

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
        if 'review' in request.FILES:
            file = request.FILES['review']
            name = request.POST.get('name')
            description = request.POST.get('description')
            obj = Review(review=file, name=name, description=description)
            obj.save()
            return JsonResponse("File uploaded successfully!", safe=False)
        else:
            return JsonResponse("No JSON data or file found in request", status=400, safe=False)
