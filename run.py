import subprocess
import sys
import os

venv_python = os.path.join(sys.prefix, "Scripts", "python.exe")

# Start app.py (Handles video upload processing)
app_process = subprocess.Popen([venv_python, "app.py"])

# Start Livedetection.py (Handles real-time video streaming)
live_process = subprocess.Popen([venv_python, "Livedetection.py"])

try:
    # Keep the main script running to monitor child processes
    app_process.wait()
    live_process.wait()
except KeyboardInterrupt:
    print("Stopping both processes...")

    # Terminate both processes gracefully
    app_process.terminate()
    live_process.terminate()


