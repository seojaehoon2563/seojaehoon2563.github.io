/*******************************
	자바스크립트 똥피하기 v0.91
	
	제작자 : 최영규
	제작일 : 2006년 9월 3일

	문의는 http://hooriza.com/
*******************************/

// 이미지 리스트
ImageList = Class.create();

ImageList.prototype = {
	
	object : null,
	image : null,
	
	size : [ undefined, undefined ],
	
	initialize : function(src, width, height) {
		
		this.size = [ width, height ];
		
		this.object = document.createElement("div");
		this.image = document.createElement("img");
		
		this.object.appendChild(this.image);
		this.image.src = src;
		this.image.border = 0;

		with (this.object.style) {
			width = this.size[0] + "px";
			height = this.size[1] + "px";
			
			overflow = "hidden";
		}
	},
	
	showImage : function(image_num) {
		this.image.style.marginLeft = "-" + (image_num * this.size[0]) + "px";
	}
}

function Dung(_game) {

	// 게임화면
	var game;
	
	// 이미지 객체
	var img;
	
	//	위치
	var pos = [ undefined, undefined ];
	
	// 타이머
	var timer;
	var timeout;
	
	// 상태
	var index;
	
	this.initialize = function(_game) {
		
		game = _game;
		img = new ImageList("images/dung.gif", 22, 17);
		
		img.object.style.position = "absolute";
		game.screen.appendChild(img.object);
		
		img.object.style.top = "-17px";
	};
	
	this.setPosition = function(x, y) {
		
		pos[0] = x;
		img.object.style.left = pos[0] + "px";

		pos[1] = y;
		img.object.style.top = (pos[1] - 17) + "px";
	};
	
	this.ready = function() {
		
		var x = parseInt(Math.random() * (game.size[0] - 22));
		
		img.showImage(0);
		this.setPosition(x, 0);
		
		index = 0;
	};
	
	this.start = function(delay) {
		
		var self = this;
		
		this.ready();
		
		if (timer) window.clearInterval(timer);
		timer = null;
		
		if (timeout) window.clearTimeout(timeout);
		timeout = window.setTimeout(function() {

			if (timer) window.clearInterval(timer);
			timer = window.setInterval(self.drop.bind(self), 50);
			
			timeout = null;
			
		}, delay);
	};
	
	this.drop = function() {
		
		if (index < 0) {
			
			if (index > -3) // 바닥에 떨어져도 어느정도까지는 충돌체크
				if (game.playing && game.man.collision(pos[0] + 22 / 2)) // 충돌했으면
					game.gameOver();
			
			switch (index--) {
			case -1: case -2:
				img.showImage(1);
				break;
				
			case -3: case -4:
				img.showImage(2);
				break;
			
			case -5:
				this.start(Math.random() * 1000);
			}

			return;
		}
		
		// 떨어지는 속도
		var incr = index++;
		if (incr > 20) incr = 20; // 최대 속도
		
		pos[1] += incr;
		
		var screen_height = game.size[1];
		
		// 바닥에 닿았으면
		if (pos[1] >= screen_height) {
			if (game.playing) game.addScore(1);
			pos[1] = screen_height;
			index = -1;
		}
		
		this.setPosition(pos[0], pos[1]);

		// 바닥과 거의 가까워졌으면 (충돌검사)
		if (pos[1] >= screen_height - 25 && game.playing) {
			if (game.playing && game.man.collision(pos[0] + 22 / 2)) // 충돌했으면
				game.gameOver();
		}
	};
	
	this.initialize(_game);
}

function Man(_game) {
	
	// 게임객체
	var game;
	
	// 이미지 객체
	var img;
	
	//	위치
	var posx = undefined;
	
	// 타이머
	var timer;
	
	// 미끄러운 정도 (0 에 가까울수록 미끄럽다)
	var slip = 1.0;
	
	// 달리는 방향
	var dir;
	
	// 달리는 모양
	var action = 0;
	
	// 스피드
	var speed = 0;
	
	var step = 1.5;
	var max_speed = 30;
	
	this.initialize = function(_game) {
		
		game = _game;
		
		img = new ImageList("images/man.gif", 18, 25);
		
		img.object.style.position = "absolute";
		img.object.style.top = "-25px";
		
		game.screen.appendChild(img.object);
	};
	
	this.collision = function(dung_x) {
		return (Math.abs(dung_x - (posx + 18 / 2)) < 17);
	};
	
	this.setLeft = function(x) {
		img.object.style.left = (posx = x) + "px";
	};
	
	this.spawn = function() {

		this.breath();
		if (timer) window.clearInterval(timer);
		timer = window.setInterval(this.breath.bind(this), 75);

		action = 0;
		speed = 0;
		
		img.object.style.top = (game.size[1] - 25) + "px";
		
		img.showImage(4);

		this.setLeft(parseInt((game.size[0] - 18) / 2));
		this.run(null);
	};
	
	this.kill = function() {
		
		if (timer) window.clearInterval(timer);
		timer = null;

		img.showImage(3);
		this.run(null);
	};
	
	this.breath = function() {
		img.showImage(4 + action);
		action = ++action % 2;
	}
	
	this.run = function(_dir) {
		dir = _dir;
		
		if (dir) { // 달리기 시작
			
			this.move(); // 일단 한번 움직이고
			if (timer) window.clearInterval(timer);
			timer = window.setInterval(this.move.bind(this), 50);
			
			// $("debug").innerHTML = dir == Event.KEY_LEFT ? "left" : "right";
			
		} else { // 멈추기 시작
			
			if (game.playing) img.showImage(4);
			// $("debug").innerHTML = "stop";
		}
	};
	
	this.move = function() {
		
		if (!dir) { // 멈춰야 되면
			
			var mul = 0.5;
			
			if (Math.abs(speed) > 10) 
				mul = 1.5;
				
			mul *= slip;
			
			if (speed == 0) {

				this.breath();
				if (timer) window.clearInterval(timer);
				timer = window.setInterval(this.breath.bind(this), 75);
				
				return;
			} else if (speed > 0) {
				speed -= step * mul;
				if (speed < 0) speed = 0;
			} else {
				speed += step * mul;
				if (speed > 0) speed = 0;
			}
			
			action = 0;
			
		} else { // 달리는 중이면
			
			speed += (dir == Event.KEY_LEFT ? -step : step);
			img.showImage((dir == Event.KEY_LEFT ? 0 : 6) + action);
			
			action = ++action % 3;

		}
		
		// 최대속도 제한
		if (speed < -max_speed) speed = -max_speed;
		else if (speed > max_speed) speed = max_speed;
		
		posx = parseInt(posx) + speed;
		
		if (posx > game.size[0] - 18) { // 오른쪽 벽에 부딛혔으면
			posx = game.size[0] - 18
			speed = 0;
		} else if (posx < 0) { // 왼쪽 벽에 부딛혔으면
			posx = 0;
			speed = 0;
		}
		
		this.setLeft(posx);
	}
	
	this.initialize(_game);
}

DungGame = Class.create();

DungGame.prototype = {
	
	// 게임이 진행될 스크린
	screen : null,
	
	// 스크린 크기
	size : [ undefined, undefined ],
	
	// 똥객체
	dungs : [ ],
	man : null,
	
	// 왼쪽 버튼 눌리고 있는지
	left : false,
	
	// 오른쪽 버튼 눌리고 있는지
	right : false,
	
	// 가장 최근에 눌린 버튼
	recent : null,
	
	// 게임중
	playing : false,
	
	// 점수판
	score : null,
	
	// 메시지
	message : null,
	msgtimer : null,
	
	initialize : function(screen, number_of_dung, score) {
		this.screen = $(screen);
		this.score = $(score);
		
		Element.makePositioned(this.screen);
		
		with (this.screen.style) {
			overflow = "hidden";
			cursor = "default";;
		}
		
		for (var i = 0; i < number_of_dung; i++)
			this.dungs.push(new Dung(this));
		
		this.man = new Man(this);
		
		Event.observe(this.screen, "keydown", this.onKeyDown.bindAsEventListener(this));
		Event.observe(this.screen, "keyup", this.onKeyUp.bindAsEventListener(this));
		
		this.size = [ this.screen.clientWidth, this.screen.clientHeight ];
		
		this.message = document.createElement("div");
		with (this.message.style) {
			position = "absolute";
			textAlign = "center";

			fontSize = "20px";
			fontFamily = "Tahoma";
		}
		
		this.screen.appendChild(this.message);
		
		this.gameReady();
	},
	
	addScore : function(value) {
		if (this.score) this.score.value = parseInt(this.score.value) + value;
	},
	
	showMessage : function(msg, autohide, func) {

		var size;
		
		if (this.msgtimer) window.clearTimeout(this.msgtimer);
		this.msgtimer = null;
		
		this.message.innerHTML = msg;
		size = [ this.message.offsetWidth, this.message.offsetHeight ];
		
		this.message.style.left = (this.size[0] - size[0]) / 2 + "px";
		this.message.style.top = (this.size[1] - size[1]) / 2 + "px";
		this.message.style.visibility = "visible";
		
		if (autohide) {
			this.msgtimer = window.setTimeout(function() {
				
				this.message.style.visibility = "hidden";
				this.msgtimer = null;
				
				if (func) func();
			}.bind(this), autohide);
		}
	},
	
	gameReady : function() {
		
		this.showMessage(
			'<div style="font-size:1.5em;">SUBERUNKER</div>' +
			'<div style="font-size:0.5em; padding:20px 0px;">HIT [SPACE] KEY</div>' +
			'<div style="font-size:0.55em; color:blue; text-decoration:underline; cursor:pointer;"'+
			' onclick="window.open(\'http://hooriza.com/\');">http://hooriza.com/</div>'
		);
	},
	
	gameStart : function() {

		this.size = [ this.screen.clientWidth, this.screen.clientHeight ];
		
		for (var i = 0; i < this.dungs.length; i++)
			this.dungs[i].start(Math.random() * 3000);
		
		this.playing = true;
		this.recent = null;
		this.left = false
		this.right = false;
		
		if (this.score) this.score.value = "0";
		
		this.man.spawn();
		this.showMessage("READY?", 1500);
	},
	
	gameOver : function() {

		this.playing = false;
		this.recent = null;
		
		this.man.kill();
		this.showMessage("DEAD", 1500, this.gameReady.bind(this));
	},
	
	onKeyDown : function(e) {
		
		if (e.keyCode == 32 && !this.playing) {
			this.gameStart();
			return;
		}
		
		if (!this.playing) return;
		if (e.keyCode != Event.KEY_LEFT && e.keyCode != Event.KEY_RIGHT) return;

		this.recent = e.keyCode;
		
		switch (e.keyCode) {
		case Event.KEY_LEFT:
			this.left = true;
			break;
			
		case Event.KEY_RIGHT:
			this.right = true;
			break;
		}
		
		this.man.run(this.recent);
		
		Event.stop(e);
	},
	
	onKeyUp : function(e) {
		
		if (!this.playing) return;
		if (e.keyCode != Event.KEY_LEFT && e.keyCode != Event.KEY_RIGHT) return;
		
		switch (e.keyCode) {
		case Event.KEY_LEFT:
			this.left = false;
			break;
			
		case Event.KEY_RIGHT:
			this.right = false;
			break;
		}
		
		this.recent = null;
		
		if (this.left) this.recent = Event.KEY_LEFT;
		else if (this.right) this.recent = Event.KEY_RIGHT;
		
		this.man.run(this.recent);
	}
};
