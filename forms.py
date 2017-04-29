from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.forms import ValidationError


class PokemonSearchForm(forms.Form):
    search_name = forms.CharField(label='Pokemon Name', max_length=100)


class MoveSearchForm(forms.Form):
    search_name = forms.CharField(label='Move Name', max_length=100)
