import datetime
from django.db import models
from django.utils import timezone

# Create your models here.


class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')

    def __str__(self):
        return self.question_text
    
    def __repr__(self):
        return self.question_text

    """
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)
    """


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    choice_date = models.DateTimeField('choice date', default=datetime.datetime.now)
    votes = models.IntegerField(default=0)

    def __str__(self):
        return self.choice_text

    def __repr__(self):
        return self.choice_text


class UserIdentification(models.Model):
    uuid = models.CharField(max_length=72)
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)

    def __str__(self):
        return self.uuid

    def __repr__(self):
        return self.uuid
