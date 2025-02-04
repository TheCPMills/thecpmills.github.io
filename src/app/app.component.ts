import { Component, OnInit } from '@angular/core';
import $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  public ngOnInit() {
    // Collapse Navbar
    // Collapse the navbar when page is scrolled
    $(window).scroll(function () {
        // if the user has scrolled down more than 100px, add a class to the navbar to make it smaller
        if ($("#navigation").offset()?.top! > 100) {
            $("#navigation").addClass("navbar-shrink");
        } else {
            $("#navigation").removeClass("navbar-shrink");
        }
    });
  }
}
