import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';

@Component({
  selector: 'app-demo-file-upload',
  templateUrl: './demo-file-upload.component.html',
  styleUrls: ['./demo-file-upload.component.css']
})
export class DemoFileUploadComponent implements OnInit {
  selectedFile: File = null;
  uploadedPercentage = 0;
  showMessage = false;
  message: String = '';
  public imagePath;
  imgURL: any;
  url: any;
  Logo: any;
  images;
  constructor(private slimLoadingBarService: SlimLoadingBarService, private http: HttpClient) { }

  ngOnInit() { }

  onFileSelected(event) {
    this.selectedFile = <File>event.target.files[0];

  }


  readUrl(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: ProgressEvent) => {
        this.url = (<FileReader>event.target).result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }
  
  handleUpload(e): void {
    this.Logo = e.target.value;
  }

  preview(files) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = "Only images are supported.";
      return;
    }

    var reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }
  }


  onUpload() {
    const fd = new FormData();
    this.showMessage = false;
    // console.log(this.selectedFile.name);
    fd.append('file', this.selectedFile, this.selectedFile.name);

    this.http.post(`/api/upload_file`, fd, {
      reportProgress: true, observe: 'events'
    }).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          this.slimLoadingBarService.start();
          break;
        case HttpEventType.Response:
          this.slimLoadingBarService.complete();
          this.message = "Uploaded Successfully";
          this.showMessage = true;
          this.url = '';
          break;
        case 1: {
          if (Math.round(this.uploadedPercentage) !== Math.round(event['loaded'] / event['total'] * 100)) {
            this.uploadedPercentage = event['loaded'] / event['total'] * 100;
            this.slimLoadingBarService.progress = Math.round(this.uploadedPercentage);
          }
          break;
        }
      }
    },
      error => {
        console.log(error);
        this.message = "Something went wrong";
        this.showMessage = true;
        this.slimLoadingBarService.reset();
      });
  }

  view() {
    fetch("http://localhost:3000/api/getData", {
      method: 'GET',
    }).then(response => response.json()).then(data => {
      if (data.success == true) {
        for (let i = 0; i <= data.results.length; i++) {
          this.images = data.results;
        }
      } else {
        console.log("Error Occour")
      }
    })
  }
}
