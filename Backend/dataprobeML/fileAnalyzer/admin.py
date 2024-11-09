from django.contrib import admin
from fileAnalyzer.models import Review

# Register your models here.
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'name', 'description', 'date', 'review' , 'reviewModes', 'bleuScore', 'crystalBleuScore', 'codeBleuScore', 'meteorScore', 'rougeScore']
    
admin.site.register(Review, ReviewAdmin)