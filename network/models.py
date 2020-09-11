from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "follower": [user.id for user in self.users.all()],
            "following": [user.id for user in self.followers.all()],
            "posts": [post.id for post in self.posts.all()]
        }


class Post(models.Model):
    text = models.TextField()
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="posts")
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(
        "User", blank=True, related_name="likes")

    def serialize(self):
        return {
            "id": self.id,
            "text": self.text,
            "user": [self.user.id, self.user.username],
            "likes": [user.id for user in self.likes.all()],
            "created_at": self.created_at.strftime("%b %-d %Y, %-I:%M %p")
        }


class Follower(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="users")
    follower = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="followers")
