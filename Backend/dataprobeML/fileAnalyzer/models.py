from django.db import models

# Create your models here.

class Review(models.Model):
    review = models.FileField(upload_to='reviews/')  # "reviews/" directory where files are saved

    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name