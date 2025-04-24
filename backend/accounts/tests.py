from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class Login(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test",
            email="test@yahoo.com",
            password="Asdf3*ertAD"
        )

    def test_login(self):
        data = {
            "username": "test",
            "password": "Asdf3*ertAD"
        }
        response = self.client.post("/auth/login/", data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

class EmailValidation(APITestCase):
    def test_validate_email(self):
        response = self.client.post("/auth/validate-email/", {"email": "test@yahoo.com"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["valid"], True)
        
        response2 = self.client.post("/auth/validate-email/", {"email": "te@j.p"})
        self.assertEqual(response2.status_code, 400)
        self.assertEqual(response2.data["valid"], False)

class UserDetails(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="test",
            email="test@yahoo.com",
            password="Asdf3*ertAD"
        )
        self.client.force_authenticate(user=self.user)

    def test_user_details(self):
        response = self.client.get("/auth/user/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "test")
