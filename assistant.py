import speech_recognition as sr
import os
import time
from datetime import datetime

def speak(text):
    os.system(f'espeak "{text}"')

def listen():
    r = sr.Recognizer()
    with sr.Microphone(sample_rate=44100, chunk_size=1024) as source:
        print("Listening...")
        r.adjust_for_ambient_noise(source, duration=1)
        try:
            audio = r.listen(source, timeout=5, phrase_time_limit=8)
            return r.recognize_google(audio).lower()
        except sr.WaitTimeoutError:
            return ""
        except Exception as e:
            print(f"Audio error: {str(e)}")
            return ""

def set_reminder(reminder_time, task):
    try:
        target = datetime.strptime(reminder_time, "%H:%M")
        now = datetime.now().replace(second=0, microsecond=0)
        
        if target < now:
            speak("Time already passed")
            return
        
        delay = (target - now).total_seconds()
        time.sleep(delay)
        speak(f"Reminder: {task}!")
        os.system("paplay /usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga")
    except Exception as e:
        print(f"Reminder error: {str(e)}")
        speak("Reminder failed")

def main():
    speak("Ready for commands")
    while True:
        command = listen()
        print("Command:", command)
        
        if "remind me to" in command:
            try:
                parts = command.split("remind me to")[1].split(" at ")
                task = parts[0].strip()
                time_str = parts[1].strip().replace(".", "")
                set_reminder(time_str, task)
                speak(f"Set reminder for {task} at {time_str}")
            except:
                speak("Failed to set reminder")
        elif "exit" in command:
            speak("Goodbye")
            break

if __name__ == "__main__":
    main()
