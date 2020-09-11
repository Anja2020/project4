
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("following", views.following, name="following"),

    # API Routes for Post
    path("posts", views.create_post, name="createPost"),
    path("posts/<int:postId>", views.update_post, name="updatePost"),
    path("posts/<int:postId>/like", views.like, name="like"),

    # API Routes for User
    path("users/<str:username>/follow", views.follow, name="follow"),
    path("users/<str:username>/unfollow", views.unfollow, name="unfollow")
]
