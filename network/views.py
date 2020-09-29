from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator


import json


from .models import User, Post, Follower


def index(request):
    # Query for all posts
    posts = Post.objects.all()
    posts = posts.order_by("-created_at")

    # Pagination
    posts = pagination(request, posts)
    return render(request, "network/index.html", {
        "posts": posts
    })


@csrf_exempt
@login_required
def following(request):
    # Query for all following user
    all_user = User.objects.all()
    following_user = []
    for user in all_user:
        if Follower.objects.filter(user=user, follower=request.user).exists():
           following_user.append(user)

    # Query for all posts of the following user
    posts = Post.objects.filter(user__in=following_user)
    posts = posts.order_by("-created_at")

    # Pagination
    posts = pagination(request, posts)
    return render(request, "network/index.html", {
        "posts": posts
    })


def pagination(request, list):
    paginator = Paginator(list, 10)
    page_number = request.GET.get('page')
    paginatedList = paginator.get_page(page_number)
    return paginatedList


def profile(request, username):
    # Query for requested user
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)
    
    # Query for all posts of the requested user
    posts = Post.objects.filter(user=user)
    posts = posts.order_by("-created_at")

    # Pagination
    posts = pagination(request, posts)

    # Check if current user is already following the requested user
    try:
        if Follower.objects.filter(user=user, follower=request.user).exists():
            following = True
        else:
            following = False
    except:

        # No user is logged-in
        return render(request, "network/profile.html", {
            "requestedUser": user,
            "posts": posts,
        })

    return render(request, "network/profile.html", {
        "requestedUser": user,
        "posts": posts,
        "following": following
    })


@csrf_exempt
@login_required
def is_following(user, request):
    # Check if requested user is following a specified user
    if Follower.objects.filter(user=user, follower=request.user).exists():
        return True
    else:
        return False


@csrf_exempt
@login_required
def follow(request, username):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Query for requested user
    try:
        user = User.objects.get(username=username)
    except Post.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    # Create Follower
    follow = Follower(user=user, follower=request.user)
    follow.save()
    follower = Follower.objects.filter(user=user)
    return JsonResponse([follower.id for follower in follower], safe=False)


@csrf_exempt
@login_required
def unfollow(request, username):
    if request.method != "DELETE":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Query for requested user
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    # Check if Follower object exists
    if Follower.objects.filter(user=user, follower=request.user).exists():

        # Delete Follower
        Follower.objects.filter(user=user, follower=request.user).delete()
        follower = Follower.objects.filter(user=user)
        return JsonResponse([follower.id for follower in follower], safe=False)
    else:
        return JsonResponse({"error": "User is not following the specified user."}, status=400)


@csrf_exempt
@login_required
def create_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Get data from reqeust body
    data = json.loads(request.body)
    text = data.get("text")

    # Check if post text is not empty
    if text == "":
        return JsonResponse({"error": "Post contains no text."}, status=400)
    else:
        # Create requested Post Object
        post = Post(user=request.user, text=text)
        post.save()
        return JsonResponse({"message": "Post saved successfully."}, status=201)


@csrf_exempt
@login_required
def update_post(request, postId):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    # Query for requested post
    try:
        post = Post.objects.get(pk=postId)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Get data from reqeust body
    data = json.loads(request.body)

    # Check if post text is not empty
    if data["text"] == "":
        return JsonResponse({"error": "Post contains no text."}, status=400)
    else:

        # Update text of the post
        post.text = data["text"]
        post.save()
        return JsonResponse({"message": "Post successfully updated."}, status=200)


@csrf_exempt
@login_required
def like(request, postId):
    # Query for requested post
    try:
        post = Post.objects.get(pk=postId)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Check if current user already liked the post
    if request.user in post.likes.all():

        # Delete like
        post.likes.remove(request.user)
        likes = len(post.likes.all())
        return JsonResponse({"liked": "false", "likes": f"{likes}"}, status=200)
    else:

        # Create like
        post.likes.add(request.user)
        likes = len(post.likes.all())
        return JsonResponse({"liked": "true", "likes": f"{likes}"}, status=200)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
