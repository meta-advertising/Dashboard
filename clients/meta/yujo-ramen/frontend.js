	
	var $site, $menu, winW, winH, winR;
	var ismobile = false;
	var currentScroll = 0;
	var totalH;
	var panel = 1;
	var sitemoving = false;
	
	var ScrollVal = new Array();
	var VideoTimeout = false;
	var ContentTimeout = false;
	var ScrollTimeout = false;
	
	var workTimeout;
	var video = 'off'; 
	
	var mousemoving;
	
	var anchored;

	
	jQuery(function($) {
		
		$('body').preLoadImages(site_url+'/themes/zims/loader/loader.gif');
		
		$('html').addClass('js');
		HandleDebug();
		
		if($('html').hasClass('mobile')) ismobile = true;
		
		$(window).on('resize', function(){
			winW = $(window).width();
			winH = $(window).height();
			winR = winW / winH;

		}).trigger('resize');

		$(window).scroll(function(){
			currentScroll = $(window).scrollTop();
			if(currentScroll>10) $('body').addClass('scrolled');
			else $('body').removeClass('scrolled');
			
			if($('#page-home').length && currentScroll>($('#ContentW').height()+winH-600) && !$('#SideLinks').hasClass('masked')){
				$('#SideLinks').addClass('masked').fadeOut(200);
			}
			else if($('#page-home').length && currentScroll<($('#ContentW').height()+winH-600)  && $('#SideLinks').hasClass('masked')){
				$('#SideLinks').removeClass('masked').fadeIn(200);
			}
			
			if($('#page-franchise').length && ismobile){
				if(currentScroll>200) $('.fixedHeroCta').fadeIn(300);
				else $('.fixedHeroCta').fadeOut(100);
			}
				
			
		});
		
		$('body').mousemove(function(){
			/*clearTimeout(mousemoving);
			$('body').addClass('mousemoving');
			mousemoving = setTimeout(function(){ $('body').removeClass('mousemoving'); }, 100);*/
		});
		
		
		
		if($('#page-franchise').length){
			
			 var queryParams = new URLSearchParams(window.location.search);

			if (queryParams.has('fbclid')) {
				var fbclid = queryParams.get('fbclid');
				//console.log('fbclid:', fbclid); 
				
				$('input#fbclid_input').val(fbclid);
			}

			if (queryParams.has('gclid')) {
				var gclid = queryParams.get('gclid');
				//console.log('gclid:', gclid); // Afficher la valeur de "gclid"
				$('input#gclid_input').val(gclid);
			}
			
			

			$('.lpFaqItem .lpFaqQuestion').on('click', function() {
				
				var $item = $(this).closest('.lpFaqItem');
				
				// Fermer les autres items
				$('.lpFaqItem').not($item).removeClass('active');
				
				// Toggle l'item cliqué
				$item.toggleClass('active');
				
			});
			
			
			HandleFranchiseForm(); 
			
			
			
		}
		
		
		HandlePopup();
		
		$('body').site();
		
		
		
		

		$('#Nav').responsiveMenu();
		
		if(!ismobile) { 
			
		}
		else{
			
			
			//HandleSwipeSliders();
		}
		
		$site.find('a.scrollLink, .mainMenuScrollLink').scrollWindow();


		

		
		//DEV
		//$('#OverlayLoad').hide();
		//
		
		if($('#page-home').length) {
					
			
			
			if($('#VideoHome').length){ HandleVideoHeaders(); }
			setTimeout(function(){ 
				$('#OverlayLoad').fadeOut(500);
				HandleHome();
				//$(window).trigger('resize');
			}, 2500);
			//$('#OverlayLoad').fadeOut(500);

			
		}
		else {
			setTimeout(function(){ $('#OverlayLoad').fadeOut(500); }, 1500);

		}
	
		
		$('#MainGal').slick({
			speed: 5000,
			autoplay: true,
			autoplaySpeed: 0,
			cssEase: 'linear',
			slidesToShow: 1,
			slidesToScroll: 1,
			variableWidth: true,
		});
		
		
		
		if(!ismobile) { 
			$('.away').map(function() {
				$(this).awayAppear();
			});
		}
		else{
			$('.away').css({'opacity': 1, 'position': 'static' });
		}	
		
		
		// Links
		$('a.fancyZims, .fancyActuGal').fancybox({ autoCenter: false, padding: 0 });

		$('#ContactLink').FancyFormShow();
				
		//$('#EnLink').click(function(){ alert('Soon...'); return false; });
		
		/*$('#ResaButton').addClass('fancybox.iframe').fancybox({ 
			width: (ismobile ? '340px' : '600px'),
			autoCenter: false,
			padding: 0,
			afterShow : function(){}
		});	*/
		

		//GMAP
		HandlePlan();
		/*$('#jGMapW').fancybox({ 
			autoCenter: (ismobile ? true : false),
			padding: 0,
			afterShow : function(){
				//ddc('lol');
				
			}
		});	
			*/

		//DATE / TIME
		//if($('input.maskedDateField, input.maskedTimeField').length) 
		if($('form').length) HandleDateTimeInput();
	
		//Langs
		$('#LangOpen, #LangLinks li.active a').on('click', function(e){
			e.preventDefault();
			if($('#LangOpen').hasClass('open')){
				$('#LangOpen').removeClass('open');
				$('#LangLinks li.disabled').hide(200);
			}
			else{
				$('#LangOpen').addClass('open');
				$('#LangLinks li.disabled').show(200);
			}
			
		});
		$('#LangsW').hoverIntent({
			over : function() { },
			out : function() { $('#LangLinks li.disabled').hide(200); },
			interval:50, timeout:200, sensitivity:7
		});
		
		HandleNewsletterForm();
		
		if($('#WordSliderW').length) {
			//$('#WordSliderW').animate({'opacity': 1}, 1);
			setTimeout(function(){
				
				HandleWordSlide($('#WordSlider1'), 45, 0, 'left'); // speed, correction, dir
				$('#WordSliderW').delay(500).animate({'opacity': 1}, 400);
			}, 1500);

		}
		
		
		
		//HandleMainMenu();
		
		/*
		if( $('#BrandsListW').length) { 
			
			
			$('.brandLogoW').on('click', function(){
				
				$('#BrandsListW').find('.active').map(function(){
					
					$(this).find('.brandTextsW').animate({'opacity': 0, 'top': '70%'}, 200, 'easeInExpo');
					$(this).removeClass('active').find('.brandLogoW').fadeIn(500);	
				});
				
				var $wrapper = $(this).parent();
				$(this).fadeOut(400);
				$wrapper.addClass('active').find('.brandTextsW').animate({'opacity': 1, 'top': 0}, 800, 'easeOutElastic');
				
			});
			
			$('.brandTextsW').hoverIntent({
				over : function() {  },
				out : function() {
					var $wrapper = $(this).parent();
					if($wrapper.hasClass('active')){
						$(this).animate({'opacity': 0, 'top': '70%'}, 200, 'easeInExpo');
						$wrapper.removeClass('active').find('.brandLogoW').fadeIn(500);	
					}	
				},
				interval:50, timeout:100, sensitivity:7
			});
			
			
		}*/
		
		
		/*if( $('#MainGal').length){
			
			$('#MainGal').slick({
				speed: 7000,
				autoplay: true,
				autoplaySpeed: 0,
				cssEase: 'linear',
				slidesToShow: 1,
				slidesToScroll: 1,
				variableWidth: true,
			});
			
			 $('a.mainGalLink').fancybox({
				autoCenter: false,
				padding: 0
			});
			
		}	*/
		
		
		
		/*if( $('#LogoBrand').length){ 
			HandleRoundDeco();
			
		}*/
		
		if($('.newsGalW').length) {
			
			setTimeout(function(){
				
				var itemwidth = $('.newsGalW').width();
				//ddc(itemwidth);
				$('.newsGalW img').width(itemwidth);
				//$('.miniGalW img').height(itemwidth/1.81);
				
				$('.newsGalW ul').carouFredSel({
					//width: itemwidth,
					//height: (itemwidth/1.81),
					items: {
						visible: 1
					},
					auto : {
						timeoutDuration : 8000
					},
					scroll : {
						fx: 'cover-fade'
					 },
					prev: {	button: ".carousel-prev", key: "left" },
					next: { button: ".carousel-next", key: "right" }
				});
				
			}, 2000);
			
			
		}
		
		if( $('#HomeGal').length){
			
			$('#MainGal').slick({
				speed: 7000,
				autoplay: true,
				autoplaySpeed: 0,
				cssEase: 'linear',
				slidesToShow: 1,
				slidesToScroll: 1,
				variableWidth: true,
			});
			
			 $('a.mainGalLink').fancybox({
				autoCenter: false,
				padding: 0
			});
			
		}	
		
		/*if($('.brandpage  #MainGal').length) {
			setTimeout(function(){ HandleMainGal(); }, 3000);
		}*/
		
		
		 $('.soonLink').attr('href', '#SoonPopupW').fancybox({ 
			autoCenter: false,
			padding: 0
		 });


	});
	
	
	
	function HandleFranchiseForm(){
		
		// Popup Form
		$(document).ready(function() {
			
			var $overlay = $('#LpFormOverlay');
			var $popup = $('#LpFormPopup');
			var $body = $('body');
			
			// Ouvrir la popup
			$(document).on('click', '[href="#LpFormSection"], [href="#LpPopupForm"], .lpOpenForm', function(e) {
				e.preventDefault();
				$overlay.addClass('active');
				$body.addClass('noscroll');
			});
			
			// Fermer avec le bouton croix
			$('#LpFormClose').on('click', function() {
				$overlay.removeClass('active');
				$body.removeClass('noscroll');
			});
			
			// Fermer en cliquant sur l'overlay (hors popup)
			$overlay.on('click', function(e) {
				if ($(e.target).is($overlay)) {
					$overlay.removeClass('active');
					$body.removeClass('noscroll');
				}
			});
			
			// Fermer avec la touche Escape
			$(document).on('keydown', function(e) {
				if (e.keyCode === 27 && $overlay.hasClass('active')) {
					$overlay.removeClass('active');
					$body.removeClass('noscroll');
				}
			});
			
			// Ouvrir automatiquement si paramètre URL (après submit)
			//var urlParams = window.location.search;
			if ($('#LpFormOverlay').hasClass('opened')) {
				$overlay.addClass('active');
				$body.addClass('noscroll');
			}
			
		});
		
	}
	
	
	function HandleMainGal() {
		
		$('#MainGal').show();
		
		$('#MainGal').slick({
			infinite: true, 
			centerMode: true,
			centerPadding: 0,
			slidesToShow: 3,
			slidesToScroll: 1,
			autoplaySpeed: 300000,
			autoplay: true,
			responsive: [
			{
			  breakpoint: 768,
			  settings: {
				arrows: false,
				centerMode: true,
				slidesToShow: 2
			  }
			},
			{
			  breakpoint: 480,
			  settings: {
				arrows: false,
				centerMode: true,
				slidesToShow: 1
			  }
			}
			],
			prevArrow: $('#Mainup'),	nextArrow: $('#Maindown')
		});
		
		
		if($('#MainGal').length) {

			 $('a.mainGalLink').fancybox({
				autoCenter: false,
				padding: 0
			});

		}

	}
	
	
	function HandleWordSlide($tickerWrapper, speed, correction, dir){
				
		var $list = $tickerWrapper.find("ul.list");
		var $clonedList = $list.clone();
		var listWidth = (ismobile ? +200 : +10);

		$list.find("li").each(function (i) {
			 listWidth += $(this, i).outerWidth(true);
		});
		if(dir=='left') { listWidth -= correction; }
		else { listWidth += correction; }
		
		var endPos = $tickerWrapper.width() - listWidth;

		$list.add($clonedList).css({
			"width" : (listWidth) + "px"
		});

		$clonedList.addClass("cloned").appendTo($tickerWrapper);

		//TimelineMax
		var infinite = new TimelineMax({repeat: -1, paused: true});
		var time = speed;

		infinite
		  .fromTo($list, time, {rotation:0.01,x:0}, {force3D:true, x: (dir=='left' ? -listWidth : listWidth), ease: Linear.easeNone}, 0)
		  .fromTo($clonedList, time, {rotation:0.01, x: (dir=='left' ? listWidth : -listWidth)}, {force3D:true, x:0, ease: Linear.easeNone}, 0)
		  .set($list, {force3D:true, rotation:0.01, x: (dir=='left' ? listWidth : -listWidth)})
		  .to($clonedList, time, {force3D:true, rotation:0.01, x: (dir=='left' ? -listWidth : listWidth), ease: Linear.easeNone}, time)
		  .to($list, time, {force3D:true, rotation:0.01, x: 0, ease: Linear.easeNone}, time)
		  .progress(1).progress(0)
		  .play();


		
	}
	
	
	function HandleRoundDeco(){ 
	
		$('body').mousemove(function(e) { 

			var decalX = Math.round((e.pageX-winW/2)/50);
			var topY = e.pageY-currentScroll;
			var decalY = Math.round((topY-winH/2)/30);
			//ddc(decalY);
			
			$('.logoPastille').css({'top': decalY, 'left': decalX});
			
		});
	}
	
	function HandleMainMenu(){	
	
		if(ismobile) { 
			var $Socials = $('#Socials').clone();
			$('#Socials').remove();
			$('#MainMenuW').append($Socials);
			
		}
	
	}
	
	
	function HandlePopup(){
	
		if($('.specialAnnounce').length){
			
			if($('.specialAnnounce').hasClass('linked')){
				if(ismobile){
					$('#PopupContent').width(winW-40).height(winW-40);
				}
				else{
					$('#PopupContent').height(winH-100).width(winH-100);
				}
				
			}
			$('.specialAnnounce').fancybox({
				autoCenter: true,
				padding: 0
			});
			$('.specialAnnounce').trigger("click");	
		}
		
	}
	
	
	var homeScroll;
	function HandleHome(){	
	
	
		/*var delai = 3000;
		$('#HomeTitleW span').map(function(){
			var $thespan = $(this);
			setTimeout(function(){ $thespan.animate({'opacity': 1}, 800, 'easeOutExpo').addClass('animated'); }, delai );
			delai+= 200;
			
		});*/
		
		
		/*
		$('#MiniGal').slick({
			infinite: true, 
			centerMode: true,
			centerPadding: 0,
			slidesToShow: 1,
			slidesToScroll: 1,
			autoplaySpeed: 3000,
			
			
			prevArrow: $('#MiniGalPrev'),	nextArrow: $('#MiniGalNext')
		});
		
		if($('#MiniGal').length) {

			 $('a.mainGalLink').fancybox({
				autoCenter: false,
				padding: 0
			});

		}*/
		
		
		homeScroll = setTimeout(function(){ 
			$('#HomeLink').animate({'opacity': 1}, 500, 'easeOutExpo');
		}, 10000 );

		$(window).scroll(function(){
			clearTimeout(homeScroll);
			$('#HomeLink').animate({'opacity': 1}, 500, 'easeOutExpo');
			
		});
		

	
	}
	
	
	var $HomePlayer;
	function HandleVideoHeaders(){
	

		var videoH = ismobile ? winW : winH;
		$('#MainVideoW').height(videoH);
		
		var videoId = $('#VideoHome').attr('id');
		$HomePlayer = videojs(videoId,{ 
			controls: true,
			loop: true,
			autoplay: true, //'muted',
			muted: true,
			fluid: true
		});
			
			
			
		$(window).resize(function(){
			clearTimeout(VideoTimeout);
			VideoTimeout = setTimeout(function(){ ResizeVideo(); }, 50);
		}).trigger('resize');
	
	
		
		if(ismobile){
			$('#HomeContentW').css('margin-top', '80vh');
		}
		else{ 
			$('#HomeContentW').css('margin-top', '100vh');
		}
		
		
		
		//VIDEO D'ACCEUIL
		/*if($('html').hasClass('tablet') || $('html').hasClass('mobile')){
			$('#VideoHome').remove();

		}
		else if(!$('html').hasClass('mobile')){
			
			
			
			$('.screenCarouselZoomW').remove();
			
			var videoId = $('#VideoHome').attr('id');
			//ddc(videoId);
			var videoHead = videojs(videoId,{ 
				controls: false,
				autoplay: 'muted',
				loop: true,
				muted: true,
				fluid: true
			});
			

			videoHead.ready(function() {
				
				//FORCED PLAY
				$(window).scroll(function(){ 
					if(video == 'off'){
						videoHead.play(); 
						video = 'play';
					}
				});
				
				$('body').mouseover(function(){
					if(video == 'off'){
						//ddc('play');
						videoHead.play(); 
						video = 'play';
					}
				});
				
				
				if(anchored){
					

					var selector = $('#'+anchored);
					var scrollVal = $(selector).offset().top;
					$('body, html').animate({ scrollTop: (scrollVal-70)}, 1, 'easeOutQuint');
					
				}
				else{
					setTimeout(function(){
						$('body, html').animate({ scrollTop: 1}, 1, 'easeOutExpo');
					},500);
					 
					setTimeout(function(){
						$('body, html').animate({ scrollTop: 0}, 2, 'easeOutExpo');
					},1000);
					
				}
				
				
					
				$(window).resize(function(){
					clearTimeout(VideoTimeout);
					VideoTimeout = setTimeout('ResizeVideo()', 50);
					//ResizeVideo();
				}).trigger('resize');
			
			});
			
			
		}*/
		
	}
	
	function ResizeVideo(){
		
		var vratio = 1;//1.777777;
		
		if(!ismobile){
			
				
			
			var w = $(window).width(); 
			var h = $(window).height();
			var vh = w/vratio;
			if(vh < h){
				$('video').css('top',0);
				var vw = h*vratio; var diff = vw-w;
				$('video').width(vw); $('video').height(h);
				$('video').css('left',-(diff));
			}
			else{
				$('video').css('left',0);
				var diff = vh-h;
				$('video').css('top',-(diff/2));
				$('video').width(w); $('video').height(vh);
			}
			
		}
		else{
			
			
			//var w = $(window).width()*2; 
			//$('video').width(w);
			/*var h = (winH*70)/100;
			$('video').height(h);*/
			
			
			/*$('video').css('top',0);
			var vw = h*vratio; var diff = vw-w;
			$('video').height(h);
			$('video').css('left',-(diff));*/
				
				
			/*var vh = w/vratio;
			if(vh < h){
				$('video').css('top',0);
				var vw = h*vratio; var diff = vw-w;
				$('video').width(vw); $('video').height(h);
				$('video').css('left',-(diff));
			}
			else{
				$('video').css('left',0);
				var diff = vh-h;
				$('video').css('top',-(diff/2));
				$('video').width(w); $('video').height(vh);
			}*/
			
		}
		
		

	}

	function HandleVideoPosition(){

		var sliderH = $(window).height();
		SetVideoPosition(sliderH);
		$(window).scroll(function(){
			SetVideoPosition(sliderH);
		});
	}

	function SetVideoPosition(sliderH){

		var currentScroll = $.browser.webkit ? document.body.scrollTop : document.documentElement.scrollTop;
		if(currentScroll < sliderH){
			val = '-'+(currentScroll/1.5)+'px';
			$('#VideoW').css('top', val);
		}
	}
		

	
	
	
	
	
	
	function HandleMainGallery(){
		
		$('#MainGal').slick({
			infinite: true, 
			centerMode: true,
			centerPadding: '50px',
			slidesToShow: 3,
			slidesToScroll: 1,
			autoplaySpeed: 3000,
			responsive: [
			{
			  breakpoint: 768,
			  settings: {
				arrows: false,
				centerMode: true,
				centerPadding: '35px',
				slidesToShow: 2
			  }
			},
			{
			  breakpoint: 480,
			  settings: {
				arrows: false,
				centerMode: true,
				centerPadding: '35px',
				slidesToShow: 1
			  }
			}
			],
			prevArrow: $('#Mainup'),	nextArrow: $('#Maindown')
		});
		
		if($('#MainGal').length) {

			 $('a.mainGalLink').fancybox({
				autoCenter: false,
				padding: 0
			});

		}
		
	}
	
	
	
	
	
	
	function HandleHomePanelPos(){
		
		var val = '-'+(currentScroll/4)+'px';
		$('#HomeOverlay').css('bottom', val);
	}
	
	function HandleGalleriesSize(){
		
		$('.verticalgallery').map(function(){
			if($(this).hasClass('squareGal')) { var galH = $(this).width(); }
			else { var galH = $(this).width()*0.65; }
			$(this).height(galH);
		});
	}
		
		
	function HandleMiniGalleries(){
		
		// SLICK GALLERY
		/*$('#DesignGal').slick({
			infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
			prevArrow: $('#Designup'),	nextArrow: $('#Designdown')
		});
		
		$('#DestinationGal').slick({
			infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
			prevArrow: $('#Destiup'), nextArrow: $('#Destidown')
		});
		
		$('#RoomGal').slick({
			infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
			prevArrow: $('#Roomup'),	nextArrow: $('#Roomdown')
		});
		
		$('#Resto1Gal').slick({
			infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
			prevArrow: $('#Resto1up'),	nextArrow: $('#Resto1down')
		});
		*/
		/*$('#Resto2Gal').slick({
			infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
			prevArrow: $('#Resto2up'), nextArrow: $('#Resto2down')
		});
		
		$('#RoofGal').slick({
			infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
			prevArrow: $('#Roofup'),	nextArrow: $('#Roofdown')
		});
		
		$('#MiceGal').slick({
			infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
			prevArrow: $('#Miceup'),	nextArrow: $('#Micedown')
		});*/
		
		var loaded;
		if(!ismobile) { 
		
			$('.homeSection').on('mouseover', function(){
				loaded = $(this).find('.verticalgalleryW').first().hasClass('loaded');
				
				if(!loaded){
					
					$(this).find('.verticalgalleryW').addClass('loaded').map(function(){
						$gal = $(this);
						//ddc($gal.find('.verticalgallery').attr('id'));
						$gal.find('.verticalgallery').slick({
							infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
							prevArrow: $gal.find('.top-arrow'),	nextArrow: $gal.find('.bottom-arrow')
						});
					
					});
				}		
			});
		}
		else{
			$('.homeSection').map(function(){
				
				$(this).find('.verticalgalleryW').map(function(){
					$gal = $(this);
					$gal.find('.verticalgallery').slick({
						infinite: true, vertical:true, verticalSwiping:true, slidesToShow: 1, slidesToScroll: 1, lazyLoad: 'progressive',
						prevArrow: $gal.find('.top-arrow'),	nextArrow: $gal.find('.bottom-arrow')
					});
				
				});
			});
		}
		
	}
	
	function HandleEmbedVideos(){
		
	
		$('body').find('.embedVideoW').map(function(index){
			
			//RATIO
			var vW = $(this).find('iframe').attr('width');
			var vH = $(this).find('iframe').attr('height');
			var newH = Math.round((parseInt($(this).width())*vH)/vW);
			
			$(this).find('iframe').attr('width', $(this).width());
			$(this).find('iframe').attr('height', newH);
			var src = $(this).find('iframe').attr('rel');
			$(this).find('iframe').attr('src', src);
			
			//$('.logoW').height($('.illusW').height()); 
			
		});
	}
	
	function HandleNewsletterForm(){
		
		
		$form = $('#NewsletterForm');
		$form.submit(function(e) {
			
			e.preventDefault();
			var fData = $form.serialize();
			var uri = $form.attr('action');

			$.get(uri, fData, function(response) {
				
				//ddc(response);
				if(response != ''){
					$('#FootNewsCheck').hide(100); 
					$('#NewsletterFormSubmit').show(200); 
					$('#FootNewsErrors').html(response); 
				}
				else{
					$('#FootNewsCheck').show(200); 
					$('#NewsletterFormSubmit').hide(100); 
					$('#FootNewsErrors').html(''); 
				}
				/*$.fancybox({
					'content':response,
					title : false,
					autoSize : true,
					fitToView  : true,
					scrollOutside : false,
					autoCenter: false,
					padding: 0,
					afterShow: function() {
						HandleDateTimeInput(); 
						$('.fancybox-inner form').FancyForm();
					}

				});
				$.fancybox.update();
				$.fancybox.hideLoading();*/
				
			});
		});
		
	}
	
	function HandleSwipeSliders(){
		

		
		if($('#HomeOffers').length){
			
			$('#HomeOffers ul').removeClass('centeredlist').removeClass('centeredlist85').removeClass('centeredlist80').removeClass('centeredlist75').removeClass('centeredlist70').removeClass('centeredlist60').removeClass('centeredlist50').removeClass('centeredlist40').addClass('panelswiper').wrap('<div class="HsliderW panelswiperW pagidotted"></div>');
			$('#HomeOffers ul > li').removeClass('col25').removeClass('col30').removeClass('col50').removeClass('col100').removeClass('away').addClass('swipeItem');
		}
		
		
		$('.panelswiper').map(function(){
			$(this).mobPanelSwipe();
		});
		
	}
	
	
	
	
	
	
	function HandleTabs(){
	
		$('.tabsMenu li a, .innerTabLink').on('click', function(e){
			
			e.preventDefault();
			var $li = $(this).parent();
			var $wrapper = $('div.tabsW');
			var $target = $($(this).attr('href'));

			if(!$target.hasClass('active')){
				if($wrapper.find('.tab.active').length){
					$wrapper.find('.tab.active').removeClass('active').fadeOut(300, function(){
						$target.addClass('active').fadeIn(300);
						$('.tabsMenu li').removeClass('active');
						$li.addClass('active');
					});
				}
				else{
					$target.addClass('active').fadeIn(300);
					$('.tabsMenu li').removeClass('active');
					$li.addClass('active');
				}
			}
			if($(this).hasClass('scollTab')){
				var scrollVal = $target.parent().offset().top;
				$('body, html').animate({ scrollTop: (scrollVal-90)}, 500, 'easeOutExpo');
			}
		});
		//$('.tab.active').fadeIn(300);
	}
	
	/**
	 * Plan d'accès Google Maps
	 */
	function HandlePlan() {

		
		var mapstyle=[{"elementType":"geometry","stylers":[{"color":"#273039"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#212121"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"color":"#757575"},{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"labels.text.fill","stylers":[{"color":"#9e9e9e"}]},{"featureType":"administrative.land_parcel","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"labels.text.fill","stylers":[{"color":"#bdbdbd"}]},{"featureType":"administrative.neighborhood","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#181818"}]},{"featureType":"poi.park","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"poi.park","elementType":"labels.text.stroke","stylers":[{"color":"#1b1b1b"}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#364657"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#8a8a8a"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#283543"}]},{"featureType":"road.arterial","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#364657"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway.controlled_access","elementType":"geometry","stylers":[{"color":"#364657"}]},{"featureType":"road.local","stylers":[{"visibility":"off"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#616161"}]},{"featureType":"transit","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"labels.text.fill","stylers":[{"color":"#757575"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"}]},{"featureType":"water","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#3d3d3d"}]}];

		

		if($('#jGMap').length) {

			mapW = $('#jGMap');
			var infoHTML = mapW.html();
			var coordinates = [mapW.find('span.latitude').html(), mapW.find('span.longitude').html()];
			var latlng = new google.maps.LatLng(coordinates[0], coordinates[1]);
			var centerp = new google.maps.LatLng(coordinates[0]-(-0.01), coordinates[1]);
			var myOptions = {
				zoom: 12,
				center: centerp, 
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				mapTypeControlOptions: {
					mapTypeIds: ['Styled']
				},
				mapTypeId: 'Styled'

			};

			var GMap = new google.maps.Map(document.getElementById("jGMap"),myOptions);
			var styledMapType = new google.maps.StyledMapType(mapstyle);
			GMap.mapTypes.set('Styled', styledMapType);

			/*var GMapInfo = new google.maps.InfoWindow({
				content : infoHTML,
				maxWidth:500

			});*/
			var GMapMarker = new google.maps.Marker({
				position:latlng,
				map:GMap,
				icon:site_url+'/themes/zims/icons/pin-ducat2.png'
			});


			//google.maps.event.addListener(GMapMarker, 'click', function() { GMapInfo.open(GMap, GMapMarker); });
			//GMapInfo.open(GMap, GMapMarker);

		}
	}


	
	
	
	(function($){
		
		
		/* #################################################################
		
		SITE
		
		###############################################################*/
		
		$.fn.site = function() { 
		
			$site = this;
			$site.totalHeight = 0;
			$site.currentScroll = 0;
			$site.range = 1;
			
			$site.currentP;
			$site.targetP;
			$site.isfirstP = true;
			$site.moving = false;
			
			
			$site.set = function(){ 


				$(window).on('resize', function(){
					$site.GetHeights();
				}).trigger('resize');
				
				$site.handleLinks();
			}
			
			$site.handleLinks = function(){ 
					
				if(!$('#page-home').length) {
					
					$('.mainMenuScrollLink').map(function(){
						var linkanchor = $(this).attr('href');
						linkanchor = linkanchor.substr(1);
						$(this).attr('href', site_url+'/'+site_lang+'/home?anchored='+linkanchor);
						$(this).removeClass('mainMenuScrollLink');
					});

				}

				$site.find('a.scrollLink, .mainMenuScrollLink').scrollWindow();
				
			}
			
			$site.GetHeights = function(){ 
				$site.totalHeight = 0;
				$('.screen').map(function(index){
					$site.totalHeight += $(this).height();
				});
			}
			
			/* LAUNCH */

			$site.set();

		},
		
		
		
		
		
		
		
		/* #################################################################
		
		MENU
		
		###############################################################*/
		
		$.fn.responsiveMenu = function() { 
		
		
			var $nav = this;
			
			var $button = $nav.find('#NavIco');
			var $button2 = $nav.find('#BookIcoMob');
			var $ov = $nav.find('#MenuOverlay');
			
			var $menu = $nav.find('#Menu');
			//var $menu = $nav.find('#SubMenu');
			
			$menu.w = 0;

			
			$nav.init = function(){ 
		
				$menu.addClass('idle').set();
				setTimeout(function(){$menu.set();}, 1000);
				$(window).on('resize', function(){
					$menu.set();
				});

				$nav.enable();

			}
			
			$menu.set = function(){ 
			
				if($menu.hasClass('idle')){
					$menu.w = $menu.width();
					$menu.css('left', -$menu.w);
				}
				
			}
			
			$menu.display = function(){ 
				
				if($nav.hasClass('subactivated')){
					
					$menu.find('li.actived').find('.submenu').fadeOut(400);
					$menu.find('li.actived').removeClass('actived');
						
					
					$menu.find('li > a, li > strong').animate({'left': 0}, 500, 'easeOutExpo');
					
					$nav.removeClass('subactivated');
					
				}
				else{
					
					if($menu.hasClass('idle')){
					
						/*if(ismobile){
							$('body, html').scrollTop(0);
						}*/
						$menu.animate({left: 0, opacity: 1}, 600, 'easeOutExpo').removeClass('idle');
						$button.addClass('active');
						$nav.addClass('open'); $('body').addClass('navopen');
						
						if(ismobile){ 
							//$('#MainSelector').fadeIn(300);
							if($('#EventResaLink').length){ $('#EventResaLink').fadeOut(100); }
						}
						else{
							$menu.find('#MainMenu > li > a, #MainMenu > li > strong').css({'opacity': 0, 'left': '-50px'})
							$menu.animate({left: 0, opacity: 1}, 500, 'easeOutExpo').removeClass('idle');
							var lidelai = 0;
							$menu.find('#MainMenu > li > a, #MainMenu > li > strong').map(function(){
								$(this).delay(300+lidelai).animate({left: 0, opacity: 1}, 800, 'easeOutElastic');
								lidelai  += 150;
							
							});
							
						}
						
						//$('#Header h1').fadeOut(150);
					}
					else{
						
						/*if(ismobile){
							$nav.css('top', 0);
						}*/
						
						$menu.animate({left: -$menu.w, opacity: 0}, 400, 'easeInExpo', function(){ 
							$menu.set(); 
							$nav.removeClass('open'); $('body').removeClass('navopen');
						}).addClass('idle');
						
						$button.removeClass('active');
						

						/*if(ismobile){ 

							if($('#EventResaLink').length){ $('#EventResaLink').fadeIn(300); }
						}*/

					}
					
				
				}
					

			}
			
			$nav.enable = function(){ 
			
				$menu.show();
				
				/*$nav.find('a.HTMLMenuItemLink').on('click', function(){ $menu.display(); });*/
				
				$button.on('click', function(e){
					e.preventDefault();
					$menu.display();
				});
				$button2.on('click', function(e){
					e.preventDefault();
					$menu.display();
				});
				$ov.on('click', function(e){
					e.preventDefault();
					$menu.display();
				});

				
				$menu.find('.HTMLMenuItemLink-Level1').on('click', function(e){
					if($(this).hasClass('scrollLink')){ $menu.display(); }
				});
				
				
				//GESTION SUBMENU
				/*if(!ismobile){
					$menu.find('li.HTMLMenuW-Level1').hoverIntent({
						over : function() { 
							decal = $(this).offset().top - $(window).scrollTop();
							$('#MainMenu li .submenu').css('padding-top', decal);
							var subW = -$(this).find('.submenu').outerWidth();
							$(this).addClass('actived').find('.submenu').css({'right': subW}).fadeIn(400);
						},
						out : function() { 
							$(this).removeClass('actived').find('.submenu').fadeOut(100);
						},
						interval:50, timeout:80, sensitivity:7
					});
				}
				else{
					
					$menu.find('.HTMLMenuTitle-Level-1').on('click', function(e){
						
						e.preventDefault();
						
						if(!$(this).parent().hasClass('actived')){
							$menu.find('.actived').removeClass('actived').find('.submenu').hide('slide', { direction:'up'}, 150);
							$(this).parent().addClass('actived').find('.submenu').show('slide', { direction:'up'}, 250);
							$nav.find('#Copyrights').hide();
						}
						else{
							$(this).parent().removeClass('actived').find('.submenu').hide('slide', { direction:'up'}, 150);
							$nav.find('#Copyrights').fadeIn(200);
						}

						
					});
					
					
					
				}*/
				
				
				
				
				

			
			}
			
		
			$nav.init();
			

		},
		
		
		
		
		$.fn.screenCarouselZoom = function(zindex) { 
		
			var $carou = this;
			$carou.zindex = zindex;
			$carou.displayed = false;
			
			$carou.zimcount = 0;
			$carou.delay = 6000;
			$carou.fade = 800;
			$carou.effect = false;

			/* ---- Methods ---- */
			
			$carou.switchZim = function(){ 
				
				$cur = $carou.find('.carouselZoomZimW.current');
				//ddc('cur : '+$cur.attr('id'));
				if(parseInt($cur.attr('rel')) < $carou.zimcount){
					$next = $carou.find('.carouselZoomZimW[rel="'+(parseInt($cur.attr('rel'))+1)+'"]');
					//ddc($next.attr('id'));
					$next.css({opacity: 1}).addClass('current');
					$cur.removeClass('current');
					$cur.animate({opacity: 0}, $carou.fade, function(){ 
						$cur.find('img').removeClass('scale'); 
					});				
					$next.find('img').addClass('scale');
				}
				else{
					$next = $carou.find('.carouselZoomZimW[rel="1"]');
					//ddc($next.attr('id'));
					$next.addClass('current').animate({opacity: 1}, $carou.fade, function(){
						$cur.find('img').removeClass('scale'); 
					});
					$next.find('img').addClass('scale');
					$cur.removeClass('current');
					
				}
				
			}

			
			$carou.roll = function(){ 

				$carou.effect = setInterval(function(){ $carou.switchZim()}, ($carou.delay));
				
				$(window).resize(function(){
					//clearInterval($carou.effect);
					$carou.find('.scale').removeClass('scale');
					$carou.find('.carouselZoomZim').map(function(index){ $carou.zimset($(this)); });
					$carou.find('.current').find('img').addClass('scale');
					
					//$carou.effect = setInterval(function(){ $carou.switchZim()}, ($carou.delay));
				});
				
			}
			
			$carou.launch = function(){ 
			
				$carou.find('.carouselZoomZimW').first().find('img').addClass('scale');
				$carou.find('.carouselZoomZimW').first().addClass('current').animate({opacity: 1}, $carou.fade);
				$carou.roll();

			}
			

			$carou.loadZims = function(){ 
			
				var zimindex = $carou.zindex;

				$carou.find('.carouselZoomZim').map(function(index){
					
					var $zim = $(this);
					var uri = $zim.attr('src');
					
					$zim.parent().css('z-index', zimindex);
					$zim.parent().attr('rel', (index+1));
				
					
					$zim.load(function(){
						//ddc(uri);
						$zim.attr('baseW', $zim.width());
						$zim.attr('baseH', $zim.height());
						$carou.zimset($zim);

						if((index+1) == $carou.zimcount && $carou.effect == false){
						
							$carou.effect = true;
							//setTimeout(function(){ $carou.launch(); }, 700);
							$carou.launch();
							
						}
						//delete loadZim;
						
					}).attr('src', uri);
					
					zimindex--;

				});

			}
			
			
			
			$carou.set = function(){ 

				$carou.css('z-index', $carou.zindex);
				$carou.zimcount = $carou.find('.carouselZoomZim').length;

				$carou.loadZims();
			}
			
			
			
			$carou.zimset = function($zim){ 
			
				var ratio = parseInt($zim.attr('baseW')) / parseInt($zim.attr('baseH'));
				var wrapperH = $carou.height();
				var wrapperW = $carou.width();
				
				if(ratio > (wrapperW / wrapperH)){ // image trop large
					$zim.height(wrapperH); $zim.width(wrapperH*ratio);
					decal = ($zim.width() - wrapperW)/2;
					$zim.css({top: 0, left: -decal});
				}
				else{// image trop haute
					//ddc(wrapperH);
					$zim.width(wrapperW); $zim.height(wrapperW/ratio);
					decal = ($zim.height() - wrapperH)/2;
					$zim.css({top: -decal, left: 0});
				}
				delete ratio; delete wrapperH; delete wrapperW;


			}
		
			
			/*----*/
			$carou.set();
		},
		
		
		
		$.fn.screenBgZim = function(zindex, launcher) {
			
			/* vars */
			var $zim = this;
			$zim.uri = $zim.attr('src');
			$zim.displayed = false;
			
			$zim.zindex = zindex+1 ;
			
		
			$zim.css({
				display : 'none'
			});
			
			
			/* ---- Methods ---- */

			/* Placing image
			----------------------------*/
			$zim.set = function(){ 
			
				
				$zim.css('z-index', $zim.zindex);
				
			
				if($zim.ratio > winR){ // image trop large
					
					$zim.height(winH); $zim.width(winH*$zim.ratio);
					decal = ($zim.width() - winW)/2;
					$zim.css({top: 0, left: -decal});

				}
				else{// image trop haute
					
					
					$zim.width(winW); $zim.height(winW/$zim.ratio);
					decal = ($zim.height() - winH)/2;
					$zim.css({top: -decal, left: 0});

				}

				if(!$zim.displayed) $zim.display();
			}
				
			/* Display
			----------------------------*/
			$zim.display = function(){ 
			
				$zim.fadeIn(1000);
				$zim.displayed = true;
				//$zim.set();	
				$(window).resize(function(){
					$zim.set();	
				});
				
			}
			
			/* LAUNCH
			----------------------------*/
			
			$zim.load(function(){	

				$zim.basewidth = $zim.width();
				$zim.baseheight = $zim.height();
				$zim.ratio = ($zim.basewidth /$zim.baseheight);
				$zim.set();
				if(launcher){
					setTimeout(function(){ $site.showPageItems(); }, 1400);
					setTimeout(function(){ $('#OverlayLoad').fadeOut(500); }, 1000);
				}
					
			}).attr('src', $zim.uri);
		},
		
		
		
		/* #################################################################
		
		PANEL PAGINATION
		
		###############################################################*/
		

		$.fn.pagination = function() {
		
			/*
				Necessite une UL 
				- avec un ID obligatoire
				- avec une classe pour le style des elements enfants				
			*/
		
			var $source = this;
			var $items = new Array();
			var $pagiW = {};
			
			var $itemsperpage = (parseInt($source.attr('rel')) > 0) ? $itemsperpage = parseInt($source.attr('rel')) : 3;

			/* ---- Methods ---- */
			
			$source.set = function(){
				
				$id = $source.attr('id')+'-pagiW';
			//ddc($id);
				$source.removeClass('paginated').before('<div id="'+$id+'" class="paginatedW"></div>');
				$pagiW = $('#'+$id);
				$style = $source.attr('class');
				
				
				/* FILL */
				$sliderI = $boucleI = $sliderPage = 1; $sliderN = $source.find('li').length;
				$list='';
				$source.find('li').map(function(){
					
					
					
					$list += '<li class="'+$(this).attr('class')+'">'+$(this).html()+'</li>';
					
					if($boucleI==$itemsperpage || $sliderI>=$sliderN){
						$pagiW.append('<div class="sliderPage'+($sliderPage==1?' active':'')+'" rel="'+$sliderPage+'"><ul class="'+$style +'">'+$list+'</ul></div>'); 
						$boucleI=0; $list=''; $sliderPage++;
					}
					
					$sliderI++;	$boucleI++;	
				});
				
				
				//$source.hide();
				$source.remove();
				
				
				/* LINKS */
				$links = '';
				if($sliderPage > 2){
					$links = '<div class="pagination"><button class="pagi-prev" type="button">Prev</button><button class="pagi-next" type="button">Next</button><ul class="pagi-dots">';
						
					for($pagei=1; $pagei<$sliderPage; $pagei++){
						$links += '<li><button class="dot '+($pagei==1?'active':'')+'" type="button" rel="'+$pagei+'">'+$pagei+'</button></li>';
					}
					$links += '</ul></div>';
				}		
				$pagiW.append($links);
				
				$pagiW.paginationSlider();

			}

			/*----*/
			if($source.find('li').length > $itemsperpage) $source.set();

		},
		
		
		$.fn.paginationSlider = function() { 
		
			var $slider = this;
			$slider.current = 1;
			$slider.targetN = 1;
			$slider.total = 0;
			$slider.displayed = false;
			
			var $pagination;

			/* ---- Methods ---- */
			
			$slider.switchPage = function(){ 
				
				var $target = $slider.find('.sliderPage[rel='+$slider.targetN+']');
				$slider.current = $slider.targetN;
				
				$slider.find('div.active').animate({ opacity: 0, left: '15%'}, 450, 'easeInQuad',function(){
					$(this).removeClass('active').hide();
					$target.addClass('active').css({opacity: 0, left: '-20%'}).show().animate({ opacity: 1, left: 0}, 800, 'easeOutQuart');
				});
			}
			
			$slider.enable = function(){ 
			
				$pagination.find('button').on('click', function(){
					
					if($(this).hasClass('dot')){  // cas points
						if(!$(this).hasClass('active')){
							$slider.targetN = parseInt($(this).attr('rel'));
							
							$pagination.find('button.active').removeClass('active');
							$(this).addClass('active');
							
							$slider.switchPage();
						}
					} 
					else{ // cas fleches
						
						if($(this).hasClass('pagi-prev')){ 
							$slider.targetN = $slider.current-1;
							$slider.targetN = $slider.targetN < 1 ? $slider.total : $slider.targetN;
						}
						if($(this).hasClass('pagi-next')){ 
							$slider.targetN = $slider.current+1;
							$slider.targetN = $slider.targetN > $slider.total ? 1 : $slider.targetN;
						}
						$slider.switchPage(); 
						$pagination.find('button.active').removeClass('active');
						$pagination.find('.dot[rel='+$slider.targetN+']').addClass('active');
					}
					
				});
				
			}
			
			$slider.set = function(){ 
				$slider.total = $slider.find('.sliderPage').length;
				$pagination = $slider.find('.pagination');
				$slider.find('.active').css({display: 'block'});
				
				$slider.enable();
			}
			
			/*----*/
			$slider.set();
		},
		
		
		
		
		
		$.fn.mobPanelSwipe = function() {
			
			var $wrapper = this;
			var $swiper;
			$wrapper.current = 1;
			$wrapper.count;
			$wrapper.interval = 50; //distance de swipe pour engager le scroll
			
			$wrapper.swipping = false;
			$wrapper.animated = false;
			var xDown = null;
			var yDown = null;
			var fw = 0;

			$wrapper.set = function(){
				
				$swiper = $wrapper.parent();
				$wrapper.attr('value', $wrapper.current);
				
				var i = 1;
				$wrapper.find('.swipeItem').map(function(){
					var oW = $(this).outerWidth();
					if(winW > oW)  { oW = winW; }
					$(this).attr('rel', i).width(oW);
					fw += oW;
					i++;
				});
				$wrapper.count = i-1;
				$wrapper.width(fw);
				$wrapper.attr('rel', $wrapper.count);
				
				
				/* Paginationdots */
				if($swiper.hasClass('pagidotted') && $wrapper.count>1){
					
					$links = '<div class="swipepagination"><ul class="">';
					for($pagei=1; $pagei<=$wrapper.count; $pagei++){
						$links += '<li><span class="dot '+($pagei==1?'active':'')+'" rel="'+$pagei+'">'+$pagei+'</span></li>';
					}
					$links += '</ul></div>';
						
					$swiper.prepend($links);
				}
				
				$wrapper.enable();
				/*setTimeout(function(){
					;
				}, 500);*/

				
				
			}

			$wrapper.enable = function(){
				
			
				$wrapper.addClass('enabled');
				$wrapper.find('.incrNum').map(function(e){
					new CountUp($(this).attr('id'), 1, parseInt($(this).attr('rel')), 0, 4, IncrOptions).start();
				});

				$wrapper.on( "touchstart", function( evt ) {
	
					var firstTouch = $wrapper.getTouches(evt);
					xDown = firstTouch[0].clientX;                                                                       
					yDown = firstTouch[0].clientY;                                                                       
	  
				});
				
				$wrapper.on( "touchend", function( evt ) {

				});
				
				$wrapper.on("touchmove", function( evt ) {
					
					if(!$wrapper.animated){

						var touches = $wrapper.getTouches(evt);
						var xUp = touches[0].clientX;  
						var yUp = touches[0].clientY;


						var xDiff = xDown - xUp;
						var yDiff = yDown - yUp;
																							 
						if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
						
							$wrapper.current = $wrapper.attr('value');
							if ( xDiff > $wrapper.interval ) {

								$wrapper.animated = true; 
								$wrapper.current++; 
								if($wrapper.current>$wrapper.count){ $wrapper.current = $wrapper.count;}
								$wrapper.changepage();
								
								
							} else if( xDiff < -($wrapper.interval)) {
			
								$wrapper.animated = true; 
								$wrapper.current--; 
								if($wrapper.current<1){ $wrapper.current = 1;}
								$wrapper.changepage();

							}                       
						} 
					}
	  
				});

			}
			
			$wrapper.changepage = function() {
				
				$wrapper.attr('value', $wrapper.current);
				var swipeVal = ($wrapper.current-1)*winW;
				if($swiper.hasClass('pagidotted')) {
					$swiper.find('.swipepagination .dot').removeClass('active');
					$swiper.find('.swipepagination .dot[rel='+$wrapper.current+']').addClass('active');
					$wrapper.find('.swipeItem.current').removeClass('current');
					$wrapper.find('.swipeItem[rel='+$wrapper.current+']').addClass('current');
					
				}
				$wrapper.stop().clearQueue().animate({ left: -swipeVal}, 500, function(){ 
					$wrapper.animated = false; 
					$wrapper.find('.incrNum').map(function(e){
						new CountUp($(this).attr('id'), 1, parseInt($(this).attr('rel')), 0, 4, IncrOptions).start();
					});
				});			
			}    
			
			$wrapper.getTouches = function(evt) {
			  return evt.touches ||             // browser API
					 evt.originalEvent.touches; // jQuery
			}    

			setTimeout(function(){ $wrapper.set(); }, 2000);
			
		},
		
		/* #################################################################
		
		SCROLLAPPEAR
		
		###############################################################*/
		
		
		
		$.fn.awayAppear = function(index) { 
		

			var $item = this;
			
				
			var effect = {opacity : 1, bottom: 0};
			var base = {opacity : 0, bottom: '-100px'};

			if($item.hasClass('awayright')){ effect = {opacity : 1, right: 0};  base = {opacity : 0, right: '-120px'}; }
			if($item.hasClass('awaytop')){ effect = {opacity : 1, top: 0};  base = {opacity : 0, top: '-100px'}; }
			if($item.hasClass('awayleft')){ effect = {opacity : 1, left: 0};  base = {opacity : 0, left: '-120px'}; }
			
			$(window).scroll(function(d,h) {
					

					
					a = $item.offset().top + $item.outerHeight();
					b = $(window).scrollTop() + $(window).height();
					c = ($(window).scrollTop() + $(window).height()) - ($item.offset().top-20);
					
					//if($item.attr('id') == 'TEST') ddc(c);
					//var decal = ($item.outerHeight()>100 ? -200 : 0);
					//decal = ($item.outerHeight()>250 ? -300 : 0);
					var decal = -(winH/2);
					
					if (a < (b-decal) && !$item.hasClass('visible')) { 
						$item.css(base).addClass('visible').animate(effect, 800, 'easeOutElastic'); 
					}
					else if(c<=0){ $item.css(base).removeClass('visible'); } // REDISPARITION

			}).trigger('scroll');	
			
			
		},
		

		
		$.fn.scrollWindow = function(){
			
			$(this).on('click', function(e){
				e.preventDefault();
				$('body, html, .scrollLink').stop(true);

				var selector = $(this).attr('href');
				var scrollVal = $(selector).offset().top;
				//var currentScroll = $(window).scrollTop();
				var space = Math.abs(currentScroll - scrollVal);
				
				if(space>0){
					
					//var speed = space > 950 ? 2700 : 2000;
					//var speed = space > 3000 ? 100 : speed;
					$('body, html').animate({ scrollTop: (scrollVal)}, 800, 'easeOutQuint');
					
					//ddc(scrollVal);
					
					$(window).bind('mousewheel', function(){
						$('body, html').stop(true);
					});

				}
				
				delete selector; delete space; //delete speed;
				
			});
		},
		
		$.fn.typeWrite = function(delai) {
			
			var $writer = this;
			var txt;
			var i = 0;
			var speed = 100;
			
			$writer.set = function(){
				
				txt = $writer.text();
				//ddc(txt);
				$writer.html('&nbsp;').show();
				//ddc(txt.charAt(3));
				setTimeout(function(){ $writer.typeWriter(); }, delai);
				
			}

			$writer.typeWriter = function(){
			  if (i < txt.length) {
				$writer.append(txt.charAt(i));
				i++;
				var nspeed = $writer.getRandomIntInclusive(speed-40, speed+30);
				setTimeout(function(){ $writer.typeWriter(); }, nspeed);
			  }
			}
			$writer.getRandomIntInclusive = function(min, max) {
			  min = Math.ceil(min);
			  max = Math.floor(max);
			  return Math.floor(Math.random() * (max - min +1)) + min;
			}
			
			$writer.set();
			
		}
		
	})(jQuery);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
