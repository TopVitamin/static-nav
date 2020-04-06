$(function () {

  // 默认搜索引擎记录
  var searchTypeStore = {
    set: function (type) {
      localStorage.setItem('SearchType', type);
    },
    get: function () {
      return localStorage.getItem('SearchType') || 'baidu';
    },
  };

  var $searchMethods = $('#search_methods');
  var $searchLogo = $('#search_logo');
  var initSearchType = searchTypeStore.get();
  $searchLogo.addClass(initSearchType).data('type', initSearchType);

  var search_types = [
    { url: 'https://www.baidu.com/s?wd=', type: 'baidu' },
    { url: 'https://www.sogou.com/web?query=', type: 'sogou' },
    { url: 'https://cn.bing.com/search?q=', type: 'bing' },
    { url: 'https://www.so.com/s?q=', type: 'so' },
    { url: 'https://www.google.com/search?q=', type: 'google' },
    { url: 'http://www.cilimao.cc/search?word=', type: 'cili' },
    { url: 'http://neets.cc/search?key=', type: 'yingyin' },
    { url: 'http://www.panduoduo.net/s/name/', type: 'wangpan' },
  ];
  $searchLogo.on('click', function () {
    $searchMethods.show();
  });

  // 搜索引擎切换
  $searchMethods.on('click', 'li', function () {
    var type = $(this).data('type');
    searchTypeStore.set(type);
    $searchLogo.removeClass()
    .data('type', type)
    .addClass(type + ' search-logo');
    $searchMethods.hide();
    $('#search_keyword').focus();
  });
  $searchMethods.on('mouseleave', function () {
    $searchMethods.hide();
  });

  var EVENT_CLEAR_KEYWORD = 'clearKeyword';
  var EVENT_SEARCH = 'search';
  // 关键词搜索输入
  $('#search_keyword').on('keyup', function (event) {
    var keyword = $(this).val();
    if(event.which==13){
    	if($('#search_result .active').length>0){
    		keyword = $('#search_result .active').eq(0).text();
    	}
      openSearch(keyword)
      return;
    }
    // TODO 上下键选择待选答案
    var bl = moveChange(event);
    if(bl){
    	keywordChange(keyword);
    }
  }).on('blur', function () { 
  // 推荐结果跳转
  $('#search_result').on('click', 'li', function () {
    var word = $(this).text();
    $('#search_keyword').val(word);
    openSearch(word);
    $('#search_result').hide();
  });
  // 解决失焦和点击事件冲突问题
  setTimeout(function() {
    $('#search_result').hide();
  }, 100)
  }).on('focus', function () {
    var keyword = $(this).val();
    keywordChange(keyword);
  });
  
  function moveChange(e){
		var k = e.keyCode || e.which;
		var bl = true;
		switch(k){
			case 38:
				rowMove('top');
				bl = false;
				break;
			case 40:
				rowMove('down');
				bl = false;
				break;
		}
		return bl;
	}
  function rowMove(move){
  	var search_result = $('#search_result');
  	var hove_li = null;
  	search_result.find('.result-item').each(function(){
  		if($(this).hasClass('active')){
  			hove_li = $(this).index();
  		}
  	});
  	if(move == 'top'){
  		if(hove_li==null){
	  		hove_li = search_result.find('.result-item').length-1;
	  	}else{
	  		hove_li--;
	  	}
  	}else if(move == 'down'){
  		if(hove_li==null){
	  		hove_li = 0;
	  	}else{
	  		hove_li==search_result.find('.result-item').length-1?(hove_li=0):(hove_li++);
	  	}
  	}
  	search_result.find('.active').removeClass('active');
    search_result.find('.result-item').eq(hove_li).addClass('active');
    $('#search_keyword').val(search_result.find('.result-item').eq(hove_li).addClass('active').text());
  }

  function keywordChange(keyword) {
    if (keyword === '') {
      $(document).trigger(EVENT_CLEAR_KEYWORD);
    } else {
      $(document).trigger(EVENT_SEARCH, keyword);
      $('#clear_keyword').show();
    }
  }

  // 清空输入框
  $('#clear_keyword').on('click', function () {
    $('#search_keyword').val('');
    $('#search_keyword').focus();
    $(document).trigger(EVENT_CLEAR_KEYWORD);
  });

  // 点击高亮显示
  $('#search_keyword').on('focus',  function () {
    $('.search-left').css(
      {
        "border-style":"solid",
        "border-color": "rgba(24, 144, 255, 1)",
        "box-shadow": "0px 0px 2px 1px rgba(145, 213, 255, 0.96)",
      }
    );
  }).on('blur',  function () {
    $('.search-left').prop('style','');
  });
  // 搜索
  $('#search_submit').on('click', function () {
    var keyword = $('#search_keyword').val();
    var type = getSeachType();
    var baseUrl = search_types.find(function (item) {
      return item.type === type;
    });
    if (baseUrl && keyword) {
      window.open(baseUrl.url + keyword);
    }
  });

  $(document).on(EVENT_CLEAR_KEYWORD, function () {
    $('#clear_keyword').hide();
    $('#search_result').hide();
  });
  $(document).on(EVENT_SEARCH, function (e, keyword) {
    getSearchResult(keyword);
  });

  // 获取搜索引擎类型
  function getSeachType() {
    return $('#search_logo').data('type');
  }

  // google 搜索结果
  function searchResultGoogle(data) {
    var result = data[1];
    result = result.map(function (item) {
      return item[0];
    });
    renderSearchResult(result);
  }

  // 百度 搜索结果
  function searchResultBaidu(data) {
    if (data === undefined) {
      return;
    }
    var result = data.s;
    renderSearchResult(result);
  }

  // 渲染搜索结果
  function renderSearchResult(array) {
    var $result = $('#search_result');
    $result.empty().hide();
    if (!array || array.length <= 0) {
      return;
    }
    for (var i = 0; i < array.length; i++) {
      var $li = $('<li class=\'result-item\'></li>');
      $li.text(array[i]);
      $result.append($li);
    }
    $result.show();
  }

  window.searchResultGoogle = searchResultGoogle;
  window.searchResultBaidu = searchResultBaidu;

  var search_suggest = {
    baidu: {
      url: 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
      data: function (keyword) {
        return {
          wd: keyword,
          cb: 'window.searchResultBaidu',
        };
      },
    },
    google: {
      url: 'http://suggestqueries.google.com/complete/search',
      data: function (keyword) {
        return {
          q: keyword,
          jsonp: 'window.searchResultGoogle',
          client: 'youtube',
        };
      },
    },
    wangpan: {
      url: 'http://unionsug.baidu.com/su',
      data: function (keyword) {
        return {
          wd: keyword,
          cb: 'window.searchResultBaidu',
        };
      },
    },
  };

  function getSearchResult(keyword) {
    var searchType = getSeachType();
    var suggest = search_suggest[searchType];
    if (!suggest) {
      suggest = search_suggest.baidu;
    }
    $.ajax({
      url: suggest.url,
      dataType: 'jsonp',
      data: suggest.data(keyword),
    });
  }

  function openSearch(keyword) {
    var type = getSeachType();
    var baseUrl = search_types.find(function (item) {
      return item.type === type;
    });
    if (baseUrl && keyword) {
      window.open(baseUrl.url + keyword, keyword);
    }
  }
});