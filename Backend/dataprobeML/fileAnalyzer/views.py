from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from fileAnalyzer.models import ReviewModel
from django.middleware.csrf import get_token

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

def get_csrf_token(request):
    csrf_token = get_token(request)
    print("CSRF TOKEN:", csrf_token)
    return JsonResponse({'csrfToken': csrf_token})