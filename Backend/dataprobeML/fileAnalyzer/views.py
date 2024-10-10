from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser
import json
import os

from .services import *
from .models import Review
from .serializer import ReviewSerializer

# Create your views here.
@csrf_exempt
@api_view(['GET', 'POST', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])
def reviewApi(request, *args, **kwargs):
    pk=kwargs.get('pk')
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
        candidateColumn = data.get('candidateColumn')
        referenceColumn = data.get('referenceColumn')

        review_data = {
            'review': file,
            'name': name,
            'description': description,
            'date': date,
            'reviewModes': json.loads(reviewModes) if reviewModes else [],
            'candidateColumn': candidateColumn,
            'referenceColumn': referenceColumn,
        }

        review_serializer = ReviewSerializer(data=review_data)
        errors = []
        
        if review_serializer.is_valid():
            review_instance = review_serializer.save()

            file_path = os.path.join('files/reviews', file.name)
            with open(file_path, 'wb+') as destination:
                for chunk in file.chunks():
                    destination.write(chunk)

            if 'BLEU' in review_data['reviewModes']:
                try:
                    bleuScores = calculate_bleu_from_csv(file_path, candidateColumn, referenceColumn)
                    review_instance.bleuScore = bleuScores
                except Exception as e:
                    errors.append({"type": "BLEU", "error": str(e)})

            if 'CRYSTALBLEU' in review_data['reviewModes']:
                try:
                    result = calculate_crystal_bleu_from_csv(file_path, candidateColumn, referenceColumn)
                    crystalBleuScores = result['score']
                    review_instance.crystalBleuScore = crystalBleuScores
                    if result.get('errors'):
                        errors.extend([{"type": "CRYSTALBLEU", "error": error["error"], "row": error["row"]} for error in result['errors']])
                except Exception as e:
                    errors.append({"type": "CRYSTALBLEU", "error": str(e)})
            
            if 'CODEBLEU' in review_data['reviewModes']:
                try:
                    result = calculate_code_bleu_from_csv(file_path, candidateColumn, referenceColumn)
                    codeBleuScores = result['score']
                    review_instance.codeBleuScore = codeBleuScores
                    if result.get('errors'):
                        errors.extend([{"type": "CODEBLEU", "error": error["error"], "row": error["row"]} for error in result['errors']])
                except Exception as e:
                    errors.append({"type": "CODEBLEU", "error": str(e)})
            
            review_instance.save()

            file_url = request.build_absolute_uri(review_instance.review.url)
            return JsonResponse({"message": "File uploaded successfully!", 
                                 "file_url": file_url,
                                 "name": review_instance.name,
                                 "date": review_instance.date,
                                 "bleuScore": review_instance.bleuScore,
                                 "crystalBleuScore": review_instance.crystalBleuScore,
                                 "codeBleuScore": review_instance.codeBleuScore,
                                 "candidateColumn": review_instance.candidateColumn,
                                 "referenceColumn": review_instance.referenceColumn,
                                 "errors": errors
                                 }, safe=False)  
        else:
            return JsonResponse(review_serializer.errors, status=400, safe=False)
    elif request.method == 'DELETE':
        if pk is None:
            return JsonResponse({"error": "Review ID is required"}, status=400)
        
        try:
            review = Review.objects.get(id=pk)
            review.delete()
            return JsonResponse({"message": "Review deleted successfully"}, status=204)
        except Review.DoesNotExist:
            return JsonResponse({"error": "Review not found"}, status=404)

