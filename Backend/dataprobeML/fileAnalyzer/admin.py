from django.contrib import admin
from fileAnalyzer.models import ReviewModel

# Register your models here.
class ReviewModelAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    
admin.site.register(ReviewModel, ReviewModelAdmin)