# Generated by Django 5.0.2 on 2024-08-27 17:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fileAnalyzer', '0006_review_bleuscore_review_codebleuscore_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='candidateColumn',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='review',
            name='referenceColumn',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]