from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews", null=True)
    review = models.FileField(upload_to='reviews/')  # "reviews/" directory where files are saved

    name = models.CharField(max_length = 255)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    reviewModes = models.JSONField(default=list)
    bleuScore = models.FloatField(default=-1)
    crystalBleuScore = models.FloatField(default=-1)
    codeBleuScore = models.FloatField(default=-1)
    candidateColumn = models.CharField(max_length=100, null=True, blank=True)
    referenceColumn = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.name