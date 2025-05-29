import os
import sys
from utils import download_video
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QLabel,
    QLineEdit, QPushButton, QFileDialog, QMessageBox, QProgressBar
)
from PyQt6.QtCore import QThread, pyqtSignal

class DownloadThread(QThread):
    finished = pyqtSignal(bool, str)
    progress = pyqtSignal(int)

    def __init__(self, url, output_path):
        super().__init__()
        self.url = url
        self.output_path = output_path

    def run(self):
        success, result = download_video(self.url, self.output_path)
        self.finished.emit(success, result)

class YouTubeDownloader(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("YouTube to MP4 Downloader")
        self.setFixedSize(500, 300)
        
        # Main widget
        widget = QWidget()
        layout = QVBoxLayout()
        
        # URL input
        layout.addWidget(QLabel("YouTube URL:"))
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText("https://www.youtube.com/watch?v=...")
        layout.addWidget(self.url_input)
        
        # Output directory
        layout.addWidget(QLabel("Save Location:"))
        self.output_label = QLabel(os.path.abspath("downloads"))
        layout.addWidget(self.output_label)
        
        browse_btn = QPushButton("Browse Folder")
        browse_btn.clicked.connect(self.browse_folder)
        layout.addWidget(browse_btn)
        
        # Progress bar
        self.progress = QProgressBar()
        self.progress.setVisible(False)
        layout.addWidget(self.progress)
        
        # Download button
        download_btn = QPushButton("Download MP4")
        download_btn.clicked.connect(self.start_download)
        layout.addWidget(download_btn)
        
        widget.setLayout(layout)
        self.setCentralWidget(widget)
        
        # Default output path
        self.output_path = os.path.abspath("downloads")
        os.makedirs(self.output_path, exist_ok=True)

    def browse_folder(self):
        path = QFileDialog.getExistingDirectory(self, "Select Download Folder")
        if path:
            self.output_path = path
            self.output_label.setText(path)

    def start_download(self):
        url = self.url_input.text().strip()
        if not url:
            QMessageBox.warning(self, "Input Error", "Please enter a YouTube URL")
            return
            
        self.progress.setVisible(True)
        self.progress.setRange(0, 0)  # Indeterminate progress
        
        self.thread = DownloadThread(url, self.output_path)
        self.thread.finished.connect(self.download_finished)
        self.thread.start()

    def download_finished(self, success, result):
        self.progress.setVisible(False)
        
        if success:
            QMessageBox.information(self, "Success", 
                f"Video downloaded successfully!\n\nSaved to:\n{result}")
        else:
            QMessageBox.critical(self, "Error", 
                f"Download failed:\n{result}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = YouTubeDownloader()
    window.show()
    sys.exit(app.exec())