from django.shortcuts import render
from django.http import JsonResponse
from .models import Review
from django.middleware.csrf import get_token
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import ReviewSerializer

# Create your views here.

def create_review(request):
    if request.method == 'POST':
        review_name = request.POST.get('reviewName')
        if review_name:
            review = Review(name = review_name)
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

class ReviewView(APIView):
    def get(self, request):
        output = [{"name":output.name, 
                   "description":output.description}
                   for output in Review.objects.all()]
        return Response(output)
    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)