import datetime
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse, HttpResponseRedirect, Http404, JsonResponse
from django.urls import reverse
from .models import Question, Choice, UserIdentification


def is_user_voted(question_id, uuid):
    ui_list = UserIdentification.objects.filter(uuid=uuid).all()
    for ui in ui_list:
        if str(ui.choice.question.id) == question_id:
            return True

    return False


def detail(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    choice_detail = []
    for c in question.choice_set.all():
        choice_detail.append({
            'choice_id': c.id,
            'choice_text': c.choice_text
        })

    return render(request, 'polls/detail.html', {
        'is_result_page': False,
        'question_id': question.id,
        'question_text': question.question_text,
        'choice_detail': choice_detail
    })


def results(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    choice_set = question.choice_set.all()
    vote_sum = sum([c.votes for c in choice_set])
    if vote_sum == 0:
        vote_sum = 1
    choice_detail = []
    for c in choice_set:
        choice_detail.append({
            'choice_text': c.choice_text,
            'choice_votes': c.votes,
            'choice_vote_percent': '{:.2%}'.format(c.votes / vote_sum)
        })
    question_end_time = max(choice_set, key=lambda c: c.choice_date) \
                        .choice_date.strftime('%Y-%m-%d %H:%M:%S')

    return render(request, 'polls/detail.html', {
        'is_result_page': True,
        'question_id': question.id,
        'question_text': question.question_text,
        'choice_detail': choice_detail,
        'question_end_time': question_end_time
    })


def vote(request, question_id):
    question = get_object_or_404(Question, pk=question_id)
    try:
        selected_choice = question.choice_set.get(pk=request.POST['choice'])
        uuid = request.POST['unique_identification']
    except (KeyError, Choice.DoesNotExist):
        choice_detail = []
        for c in question.choice_set.all():
            choice_detail.append({
                'choice_id': c.id,
                'choice_text': c.choice_text
            })

        return render(request, 'polls/detail.html', {
            'question_id': question.id,
            'error_message': '请选择有效选项',
            'is_result_page': False,
            'question_text': question.question_text,
            'choice_detail': choice_detail
        })

    if not is_user_voted(question.id, uuid):
        ui = UserIdentification(uuid=uuid, choice_id=selected_choice.id)
        ui.save()
        selected_choice.votes = selected_choice.votes + 1
        selected_choice.choice_date = datetime.datetime.now()
        selected_choice.save()

    return HttpResponseRedirect(reverse('polls:results', args=(question.id, )))


def index(request):
    question_detail = []
    for q in Question.objects.order_by("-pub_date"):
        if q.choice_set.count() <= 0:
            continue
        question_detail.append({
            'question_id': q.id,
            'question_text': q.question_text,
            'vote_count': sum([c.votes for c in q.choice_set.all()]),
            'published_date': q.pub_date.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return render(request, "polls/index.html", {'question_detail': question_detail})


def user_voted(request):
    question_id = request.GET.get('question_id')
    uuid = request.GET.get('uuid')

    return JsonResponse({
        'status': 1,
        'data': is_user_voted(question_id, uuid)
    })

