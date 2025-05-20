from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from database import db, User, TestResult
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'mssql+pyodbc://opmadminuser:Willowglen%4012345@WGN-009-530\\MSSQLSERVER2022/speech_to_text?driver=ODBC+Driver+17+for+SQL+Server&TrustServerCertificate=yes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Create database tables within application context
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('index.html')
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        if username:
            user = User.get_or_create(username)
            login_user(user)
            return redirect(url_for('index'))
        return render_template('login.html', error="Username is required")
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/submit_feedback', methods=['POST'])
@login_required
def submit_feedback():
    try:
        data = request.json
        TestResult.create(
            user_id=current_user.id,
            spoken_text=data['spokenText'],
            is_correct=data['isCorrect'],
            actual_text=data.get('actualText')
        )
        return jsonify({"status": "success"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)