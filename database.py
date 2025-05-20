from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    test_results = db.relationship('TestResult', backref='user', lazy=True)

    @staticmethod
    def get_or_create(username):
        user = User.query.filter_by(username=username).first()
        if not user:
            user = User(username=username)
            db.session.add(user)
            db.session.commit()
        return user

class TestResult(db.Model):
    __tablename__ = 'test_results'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    spoken_text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    actual_text = db.Column(db.Text, nullable=True)  # For storing correct text when transcription is wrong
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    @classmethod
    def create(cls, user_id, spoken_text, is_correct, actual_text=None):
        test_result = cls(user_id=user_id, spoken_text=spoken_text, is_correct=is_correct, actual_text=actual_text)
        db.session.add(test_result)
        db.session.commit()
        return test_result

def init_db():
    db.create_all()