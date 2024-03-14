from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from fileAnalyzer.models import ReviewModel

def create_review(request):
    if request.method == 'POST':
        review_name = request.POST.get('reviewName')
        if review_name:
            review = ReviewModel(name = review_name)
            review.save()
            return JsonResponse({'message': 'Review created.'}, status=201)
        else:
            return JsonResponse({'error': 'Name of review empty.'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)