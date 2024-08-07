from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser
import json

from .models import Review
from .serializer import ReviewSerializer

# Create your views here.
@csrf_exempt
@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def reviewApi(request):
    if request.method == 'GET':
        reviews = Review.objects.all()
        reviews_data = []
        for review in reviews:
            review_data = ReviewSerializer(review).data
            review_data['file'] = request.build_absolute_uri(review.review.url)
            reviews_data.append(review_data)
        return JsonResponse(reviews_data, safe=False)
    elif request.method == 'POST':
        data = request.data

        if 'review' not in data:
            return JsonResponse({"error": "No file part in the request"}, status=400, safe=False)

        file = data['review']
        name = data.get('name')
        description = data.get('description')
        date = data.get('date')
        reviewModes = data.get('reviewModes')

        review_data = {
            'review': file,
            'name': name,
            'description': description,
            'date': date,
            'reviewModes': json.loads(reviewModes) if reviewModes else []
        }

        review_serializer = ReviewSerializer(data=review_data)
        
        if review_serializer.is_valid():
            review_instance = review_serializer.save()
            file_url = request.build_absolute_uri(review_instance.review.url)
            return JsonResponse({"message": "File uploaded successfully!", "file_url": file_url}, safe=False)  
        else:
            return JsonResponse(review_serializer.errors, status=400, safe=False)
