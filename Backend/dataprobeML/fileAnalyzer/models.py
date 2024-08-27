from django.db import models

# Create your models here.

class Review(models.Model):
    review = models.FileField(upload_to='reviews/')  # "reviews/" directory where files are saved

    name = models.CharField(max_length = 255)
    description = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    reviewModes = models.JSONField(default=list)
    bleuScore = models.FloatField(default=-1)
    crystalBleuScore = models.FloatField(default=-1)
    codeBleuScore = models.FloatField(default=-1)

    def __str__(self):
        return self.name