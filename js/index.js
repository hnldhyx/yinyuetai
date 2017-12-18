// 功能函数，用于显示和隐藏顶部的导航栏
(function navShow(){
	var btn = document.querySelector('#menuBtn');
	var nav = document.querySelector('#nav');
	// 为频道按钮设置事件，显示与隐藏导航栏
	btn.addEventListener('touchstart',function(e){
		e.stopPropagation();
		if(this.className == 'menuBtnClose'){
			this.className = 'menuBtnShow';
			nav.style.display = 'block';
		}else{
			this.className = 'menuBtnClose';
			nav.style.display = 'none';
		}
	});
	// 点击其他区域，导航栏消失
	document.addEventListener('touchstart',function(){
		if(btn.className == 'menuBtnShow'){
			btn.className = 'menuBtnClose';
			nav.style.display = 'none';
		}
	});
	// 点击导航栏里面内容的时候，导航栏不消失，阻止冒泡
	nav.addEventListener('touchstart',function(e){
		e.stopPropagation();
	});
})();

// 功能函数，用于图片幻灯片
(function scrollPic(){
	var wrap = document.querySelector('#picTab');
	var list = document.querySelector('#picList');
	list.innerHTML += list.innerHTML;
	var lis = document.querySelectorAll('#picList li');
	var navs = document.querySelectorAll('#picNav span');
	// 设置样式
	wrap.style.height = lis[0].offsetHeight + 'px';
	list.style.width = lis.length * 100 + '%';
	for(var i=0;i<lis.length;i++){
		lis[i].style.width = 1/lis.length * 100 + '%';
	}

	// 定时器
	var timer = 0;
	auto();

	/*解决只有横向移动时幻灯片才能动，而纵向时滑动时不能移动*/

	// 拖动时不允许中途转向，即只要开始拖动了，要么纵向拖，要么横向拖
	// true为允许拖动
	// false时则禁止move
	// 默认时是允许拖动的，故设为true，当发生了其他方向的移动时，则禁止拖动，设为false
	var isMove = true;

	// 当来回拖动时，会出现X比Y小的情况导致不正常的假死
	// 故只在第一次滑动时，才检查往哪个方向移动，之后就不再判断了
	var isFirst = true;

	// 手指按下
	var startPoint = 0;
	var startX = cssTransform(list,'translateX',0);
	var now = 0;
	wrap.addEventListener('touchstart',function(e){
		clearInterval(timer);
		list.style.transition = 'none';
		if(now == 0){
			now = navs.length;
		}else if(now == lis.length-1){
			now = navs.length-1;
		}
		cssTransform(list,'translateX',-now*lis[0].offsetWidth);
		startPoint = {
			pageX:e.changedTouches[0].pageX,
			pageY:e.changedTouches[0].pageY
		};
		startX = cssTransform(list,'translateX');
		isMove = true;
		isFirst = true;
	});

	// 手指移动
	wrap.addEventListener('touchmove',function(e){
		if(!isMove){
			return;
		}
		var touch = e.changedTouches[0];
		var endPoint = touch;
		var disX = endPoint.pageX - startPoint.pageX;
		var disY = endPoint.pageY - startPoint.pageY;
		if(isFirst){
			if(Math.abs(disY) > Math.abs(disX)){
				// 用户此时向上拖动
				isMove = false;
			}
			isFirst = false;
		}
		
		if(isMove){
			cssTransform(list,'translateX',disX+startX);
		}
	});

	// 手指松开
	wrap.addEventListener('touchend',function(){
		var translateX = cssTransform(list,'translateX');
		now = Math.round(-translateX/lis[0].offsetWidth);
		list.style.transition = '.5s';
		cssTransform(list,'translateX',-now*lis[0].offsetWidth);
		// 导航栏一起动
		for(var i=0;i<navs.length;i++){
			navs[i].className = '';
		}
		navs[now%navs.length].className = 'active';
		auto();
	});

	// 自动播放
	function auto(){
		clearInterval(timer);
		timer = setInterval(function(){
			if(now == lis.length-1){
				now = navs.length-1;
			}
			list.style.transition = 'none';
			cssTransform(list,'translateX',-now*lis[0].offsetWidth);
			setTimeout(function(){
				now++;
				list.style.transition = '.5s';
				cssTransform(list,'translateX',-now*lis[0].offsetWidth);
				// 导航栏一起动
				for(var i=0;i<navs.length;i++){
					navs[i].className = '';
				}
				navs[now%navs.length].className = 'active';
			},30);
		},3000);
	}
})();

// 导航栏
(function navSwipe(){
	var navScroll = document.querySelector('#navScroll');
	var navs = document.querySelector('#navs');


	var startPoint = 0;
	var startX = 0;
	


	// 设置最大能拉动的位置以及滑动时，根据滑动速度计算得到的缓冲距离
	// 缓冲是指在抬手后，根据滑动的速度再往前滑动一小段，故缓冲具体滑动的代码应在touchend里面写
	var minX = navScroll.offsetWidth - navs.offsetWidth;
	var step = 1;
	var lastX = 0;//上次的距离
	var lastTime = 0;//上次的时间
	var lastDis = 0;//距离差值
	var lastTimeDis = 0;//时间差值

	
	cssTransform(navs,'translateZ',.01);
	navScroll.addEventListener('touchstart',function(e){
		navs.style.transition = 'none';
		startPoint = e.changedTouches[0].pageX;
		startX = cssTransform(navs,'translateX');
		// 初始化
		step = 1;
		lastX = startX;
		lastTime = new Date().getTime();
		lastDis = 0;
		lastTimeDis = 0;
	});

	navScroll.addEventListener('touchmove',function(e){
		var endPoint = e.changedTouches[0].pageX;
		var dis = endPoint - startPoint;
		var left = startX + dis;
		var nowTime = new Date().getTime();

		/*
			1、滑动到最左边时，navs的translateX为0，即left(startX+dis)为0。大于0时即为超过；
			2、滑动到最后边时，最多允许nav滑动的距离是navs和navScroll的宽度差值，
			   故在最右边时，navs的translateX为宽度差值的负值，即外框的宽度-内容的宽度。
			   此时，继续往左拉，则右边出现空白的宽度为此时的 translateX - 理论上最右边的边界值，
			   由于都是负数，故  minX - left
		*/
		if(left > 0){
			// 随着left的值，即左边空白区域变大，相应的拖动阻力越大，甚至有回弹
			step = 1-left / navScroll.clientWidth;
			left = parseInt(left * step);
		}else if(left < minX){//滑动到最右边时
			var over = minX - left;
			step = 1-over / navScroll.clientWidth;
			over = parseInt(over * step);
			left = minX - over;
		}


		lastDis = left - lastX;
		lastTimeDis = nowTime - lastTime;
		lastX = left;
		lastTime = nowTime;

		cssTransform(navs,'translateX',left);
	});

	/*
		缓冲的快慢：
			和手指移动的最后一次移动速度有关
			速度越快，缓冲距离越大
			速度慢，缓冲距离则小
			速度 = 距离 / 时间
			距离差值 = 上一次位置 和 移动后位置的差值
			时间差值 = 上一次时间 和 移动后时间的差值
	*/
	navScroll.addEventListener('touchend',function(e){
		//用距离差值除以时间差值得到速度，200为时间系数，得到缓冲距离
		var speed = (lastDis / lastTimeDis)*300;
		var left = cssTransform(navs,'translateX');
		// 当前值加缓冲距离得到目标点
		var target = left + speed;
		var type = 'cubic-bezier(.34,.92,.58,.9)';
		var time = Math.abs(speed * .9);
		time = time<300?300:time;

		// 如果目标终点超过了最大拖动的距离，则回到最大距离处
		if(target > 0){
			target = 0;
			type = 'cubic-bezier(.08,1.44,.6,1.46)';
		}else if(target < minX){
			target = minX;
			type = 'cubic-bezier(.08,1.44,.6,1.46)';
		}

		// transition:300ms cubic-bezier(xx,xx,xx,xx);
		navs.style.transition = time + 'ms ' + type;
		cssTransform(navs,'translateX',target);
	});
})();

// 图片选项卡
(function tab(){
	var tabList = document.querySelectorAll('.tabList');
	var tabNav = document.querySelectorAll('.tabNav');
	var width = tabNav[0].offsetWidth;
	for(var i=0;i<tabNav.length;i++){
		swipe(tabNav[i],tabList[i]);
	}
	function swipe(nav,list){
		cssTransform(list,'translateZ',.01);
		cssTransform(list,'translateX',-width);
		var startPoint = 0;
		var startX = 0;
		var now = 0;
		var isFirst = true;
		var isMove = true;
		var next = document.querySelectorAll('.tabNext');
		var isLoad = false;
		var navA = nav.getElementsByTagName('a');
		var navActive = nav.getElementsByTagName('span')[0];
		list.addEventListener('touchstart',function(e){
			if(isLoad){return;}
			list.style.transition = 'none';
			startPoint = {
				pageX:e.changedTouches[0].pageX,
				pageY:e.changedTouches[0].pageY
			};
			startX = cssTransform(list,'translateX');
			isMove = true;
			isFirst = true;
		});
		list.addEventListener('touchmove',function(e){
			if(isLoad){return;}
			if(!isMove){
				return;
			}
			var nowPoint = e.changedTouches[0];
			var disX = nowPoint.pageX - startPoint.pageX;
			var disY = nowPoint.pageY - startPoint.pageY;
			if(isFirst){
				if(Math.abs(disY) > Math.abs(disX)){
					isMove = false;
				}
			}
			if(isMove){
				cssTransform(list,'translateX',startX+disX);
			}
			if(Math.abs(disX) > width/2){
				end(disX);
			}
		});
		list.addEventListener('touchend',function(){
			if(isLoad){return;}
			list.style.transition = '.5s';
			cssTransform(list,'translateX',-width);
		});




		function end(disX){
			isLoad = true;
			// 使用本身除以其绝对值判断其运动方向，1为右，-1为左
			var dir = disX / Math.abs(disX);
			var target = dir > 0 ? 0 : -2 * width;

			// dir为1即为显示下一张，-1为上一张
			now -= dir;
			if(now < 0){
				now = navA.length-1;		
			}else if(now >= navA.length){
				now = 0;
			}

			list.style.transition = '.3s';
			cssTransform(list,'translateX',target);
			list.addEventListener('webkitTransitionEnd',transitionEnd);
			list.addEventListener('transitionend',transitionEnd);
		};
		function transitionEnd(){
			var tabNavSpan = navA[now].offsetLeft;
			cssTransform(navActive,'translateX',tabNavSpan);
			list.removeEventListener('webkitTransitionEnd',transitionEnd);
			list.removeEventListener('transitionend',transitionEnd);
			for(var i=0;i<next.length;i++){
				next[i].style.opacity = 1;
			}
			// 模拟ajax
			setTimeout(function(){
				list.style.transition = 'none';
				cssTransform(list,'translateX',-width);
				isLoad = false;
				for(var i=0;i<next.length;i++){
					next[i].style.opacity = 0;
				}
			},1000);
		};
	}
})();


/*将默认事件禁止，故系统滚动条无效，需自制滚动条*/
// 搜索区域部分
/*(function search(){
	var wrap = document.querySelector('.wrap');
	var input = document.querySelector('input');
	wrap.onscroll = function(){
		input.value = 1;
	};
})();*/