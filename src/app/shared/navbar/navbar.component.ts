import { Component, OnInit, Renderer, ViewChild, ElementRef, Directive } from '@angular/core';
import { ROUTES } from '../.././sidebar/sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AppService, AssetService, UserService } from '../../services';

const misc: any = {
  navbar_menu_visible: 0,
  active_collapse: true,
  disabled_collapse_init: 0,
};

declare var $: any;
@Component({
  selector: 'app-navbar-cmp',
  templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit {

  private listTitles: any[];
  location: Location;
  private nativeElement: Node;
  private toggleButton: any;
  private sidebarVisible: boolean;
  currentUser:any ={};

  @ViewChild('app-navbar-cmp') button: any;

  constructor(
    location: Location,
    private renderer: Renderer,
    private element: ElementRef,
    private assetService: AssetService,
    private translate: TranslateService,
    private appService: AppService,
    private userService: UserService,
    private router: Router,
  ) {
    this.translate.use(this.appService.getLang());
    this.location = location;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
  }

  ngOnInit() {
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = user.account;

    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    if ($('body').hasClass('sidebar-mini')) {
      misc.sidebar_mini_active = true;
    }
    if ($('body').hasClass('hide-sidebar')) {
      misc.hide_sidebar_active = true;
    }
    $('#minimizeSidebar').click(function () {
      if (misc.sidebar_mini_active === true) {
        $('body').removeClass('sidebar-mini');
        misc.sidebar_mini_active = false;

      } else {
        setTimeout(function () {
          $('body').addClass('sidebar-mini');

          misc.sidebar_mini_active = true;
        }, 300);
      }

      // we simulate the window Resize so the charts will get updated in realtime.
      const simulateWindowResize = setInterval(function () {
        window.dispatchEvent(new Event('resize'));
      }, 180);

      // we stop the simulation of Window Resize after the animations are completed
      setTimeout(function () {
        clearInterval(simulateWindowResize);
      }, 1000);
    });
    $('#hideSidebar').click(function () {
      if (misc.hide_sidebar_active === true) {
        setTimeout(function () {
          $('body').removeClass('hide-sidebar');
          misc.hide_sidebar_active = false;
        }, 300);
        setTimeout(function () {
          $('.sidebar').removeClass('animation');
        }, 600);
        $('.sidebar').addClass('animation');

      } else {
        setTimeout(function () {
          $('body').addClass('hide-sidebar');
          // $('.sidebar').addClass('animation');
          misc.hide_sidebar_active = true;
        }, 300);
      }

      // we simulate the window Resize so the charts will get updated in realtime.
      const simulateWindowResize = setInterval(function () {
        window.dispatchEvent(new Event('resize'));
      }, 180);

      // we stop the simulation of Window Resize after the animations are completed
      setTimeout(function () {
        clearInterval(simulateWindowResize);
      }, 1000);
    });

    this.init();
  }

  changeLanguage(index) {
    this.selected_lang = this.languages[index].name;
    this.selected_name = this.languages[index].long_name;
    this.appService.setLang(this.selected_lang);
    this.translate.use(this.selected_lang);
  }
  languages: any = [];
  selected_lang = 'ro';
  selected_name = 'romanian';
  init() {
    this.assetService.getLanguages()
      .then(languages => {
        this.languages = languages;
        this.selected_lang = this.appService.getLang();
        this.languages.forEach(item => {
          if (item.name == this.selected_lang) {
            this.selected_name = item.long_name;
          }
        })
      })
      .catch(error => {
        this.languages = [];
        this.selected_lang = 'ro';
      })
  }
  logout() {
    this.userService.logout();
    setTimeout(function () {
      this.router.navigateByUrl('/login');
    }.bind(this), 100);
  }
  onResize(event) {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  }
  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);
    body.classList.add('nav-open');

    this.sidebarVisible = true;
  };
  sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    if (this.toggleButton && this.toggleButton.classList) {
      this.toggleButton.classList.remove('toggled');
    }
    this.sidebarVisible = false;
    body.classList.remove('nav-open');
};
  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  };

  getTitle() {
    let titlee: any = this.location.prepareExternalUrl(this.location.path());
    for (let i = 0; i < this.listTitles.length; i++) {
      if (this.listTitles[i].type === "link" && this.listTitles[i].path === titlee) {
        return this.listTitles[i].title;
      } else if (this.listTitles[i].type === "sub") {
        for (let j = 0; j < this.listTitles[i].children.length; j++) {
          let subtitle = this.listTitles[i].path + '/' + this.listTitles[i].children[j].path;
          if (subtitle === titlee) {
            return this.listTitles[i].children[j].title;
          }
        }
      }
    }
    return 'Dashboard';
  }
  getPath() {
    return this.location.prepareExternalUrl(this.location.path());
  }
}
