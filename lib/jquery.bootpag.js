/**
 * @preserve
 * bootpag - jQuery plugin for dynamic pagination
 *
 * Copyright (c) 2015 botmonster@7items.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://botmonster.com/jquery-bootpag/
 *
 * Version:  1.0.7
 *
 */
(function ($, window) {

  $.fn.bootpag = function (options) {

    var $owner = this,
      settings = $.extend({
          total: 0,
          page: 1,
          maxVisible: 5,
          dataCount : 0,
          perPageNumbers: [10, 20, 50, 100],
          currentPerPageNumbers: null,
          leftPageText: '',
          rightPageText: '項紀錄',
          href: 'javascript:void(0);',
          hrefVariable: '{{number}}',
          firstLastUse: true,
          first: '<span aria-hidden="true">&larr;</span>',
          last: '<span aria-hidden="true">&rarr;</span>',
          wrapClass: 'pagination',
          activeClass: 'active',
          disabledClass: 'disabled',
          lastClass: 'last',
          firstClass: 'first',
          leftPageText1: '顯示第',
          leftPageText2: '到第',
          leftPageText3: '項紀錄，總共',
          leftPageText4: '項紀錄;每頁顯示',
          goToPage1: '前往',
          goToPage2: '頁',
          maxDropDownPage: 10000,
        },
        $owner.data('settings') || {},
        options || {});

    if (settings.total <= 0)
      return this;

    var start = ((settings.page -1) * settings.currentPerPageNumbers)+1;
    var end   = settings.page * settings.currentPerPageNumbers;

    settings.leftPageText = settings.leftPageText1 + ' ' + start + ' ' +
      settings.leftPageText2 + ' ' +
      end + ' ' + settings.leftPageText3 + ' ' + settings.dataCount +
      ' ' + settings.leftPageText4;

    if (!$.isNumeric(settings.maxVisible) && !settings.maxVisible) {
      settings.maxVisible = parseInt(settings.total, 10);
    }

    $owner.data('settings', settings);

    function renderPage($bootpag, page, ppn) {
      page = parseInt(page, 10);
      settings.page = page;
      settings.currentPerPageNumbers = ppn;

      var $page = $bootpag.find('li');
      $page.removeClass(settings.activeClass);

      var $currPage = $page.filter('[data-lp=' + page + ']');
      $currPage.not('.first, .last').addClass(settings.activeClass);

      $owner.find('select.bootpage_per_numbers').find('option[value="' + ppn + '"]').prop('selected', true);
      $owner.data('settings', settings);
    }

    function href(c) {
      return settings.href.replace(settings.hrefVariable, c);
    }

    function perPageNumbersView() {
      var t = settings.perPageNumbers.length;

      var selectStr = '<div style="margin: 6px 0;">' + settings.leftPageText + '</div>' +
        '<div class="bootpag_drop"><select class="bootpage_per_numbers form-control">';
      var optionsStr = '';
      for (var i = 0; i < t; i++) {
        var numbers = settings.perPageNumbers[i];
        var selected = (numbers === settings.currentPerPageNumbers) ? 'selected' : '';
        optionsStr += '<option value="' + numbers + '"' + selected + '>' + numbers + '</option>';
      }

      return '<div style="display: flex; margin: 22px 22px 0 0;">' + selectStr + optionsStr + '</select></div><div style="margin: 6px 0;">' + settings.rightPageText + '</div></div>';
    }

    function goToPageView(page, totalPage) {
      var inputStr,pageSelect = '';

      if (totalPage < settings.maxDropDownPage) {
        pageSelect = '<select class="form-control bootpage_go_to_page">';
        for (var i = 1; i <= totalPage; i++) {
          var selected = (i === page) ? 'selected' : '';
          pageSelect += '<option value="' + i + '" ' + selected + '>' + i + '</option>';
        }
        pageSelect += '</select>';


      }
      else {
        pageSelect = '<input type="number" class="form-control bootpage_go_to_page" value="' + settings.page + '"/>';
      }

      inputStr = '<div style="display: flex; margin: 22px 22px 0 22px;"><div style="margin: 6px 0;">' + settings.goToPage1 + '</div>' +
        '<div>' + pageSelect + '</div><div style="margin: 6px 0;">' + settings.goToPage2 + '</div>';

      return inputStr;
    }

    function createPageArray(start, end) {
      var tempArray = [];

      for (var c = start; c <= end; c++) {
        tempArray = tempArray.concat(['<li data-lp="', c, '"><a href="', href(c), '">', c, '</a></li>']);
      }

      return tempArray;
    }

    return this.each(function () {

      var $bootpag, me = $(this),
        p = ['<div><ul class="', settings.wrapClass, ' bootpag nav-bootpag">'],
        currentPageIndex = parseInt(settings.page, 10),
        totalPage = parseInt(settings.total, 10);

      currentPageIndex = (currentPageIndex === 0) ? 1 : currentPageIndex;

      // add first
      if (settings.firstLastUse) {
        p = p.concat(['<li data-lp="1" class="', settings.firstClass,
          '"><a href="', href(1), '">', settings.first, '</a></li>']);
      }

      // situation 1
      if (settings.maxVisible >= totalPage) {
        p = p.concat(createPageArray(1, totalPage));
      }

      // situation 2
      if (settings.maxVisible % 2 === 1 && settings.maxVisible < totalPage) {
        var mid = Math.floor(settings.maxVisible / 2);
        var min = settings.maxVisible - mid;
        var max = totalPage - mid;


        if (currentPageIndex <= min) {
          var start = 1, end = settings.maxVisible;
          p = p.concat(createPageArray(start, end));
        }
        else if (currentPageIndex > min && currentPageIndex <= max){
          var start = currentPageIndex - mid, end = start + (settings.maxVisible - 1);
          p = p.concat(createPageArray(start, end));
        }
        else {
          var start = totalPage - (settings.maxVisible - 1), end = totalPage;
          p = p.concat(createPageArray(start, end));
        }
      }

      // situation 3
      if (settings.maxVisible % 2 === 0 && settings.maxVisible < totalPage) {
        var mid = settings.maxVisible / 2;
        var min = settings.maxVisible - mid;
        var max = totalPage - mid;


        if (currentPageIndex <= min) {
          var start = 1, end = settings.maxVisible;
          p = p.concat(createPageArray(start, end));
        }
        else if (currentPageIndex > min && currentPageIndex <= max) {
          var start = currentPageIndex - (mid - 1), end = currentPageIndex + mid;
          p = p.concat(createPageArray(start, end));
        }
        else {
          var start = totalPage - (settings.maxVisible - 1), end = totalPage;
          p = p.concat(createPageArray(start, end));
        }
      }

      // add last
      if (settings.firstLastUse) {
        p = p.concat(['<li data-lp="', totalPage, '" class="last"><a href="',
          href(totalPage), '">', settings.last, '</a></li>']);
      }

      p.push('</ul></div>');
      me.css('display', 'flex');
      me.empty();
      me.append(perPageNumbersView());
      me.append(p.join(''));
      me.append(goToPageView(
        parseInt(settings.page, 10), settings.total));
      $bootpag = me.find('ul.bootpag');

      me.find('li').click(function paginationClick() {

        var me = $(this);
        if (me.hasClass(settings.disabledClass) || me.hasClass(settings.activeClass)) {
          return;
        }

        var page = parseInt(me.attr('data-lp'), 10);
        var ppn = parseInt($owner.find('select.bootpage_per_numbers').find('option:selected').val(), 10);

        $owner.find('ul.bootpag').each(function () {
          renderPage($(this), page, ppn);
        });

        $owner.trigger('page', [page, ppn]);
      });

      me.find('select.bootpage_per_numbers').change(function paginationChange() {
        var page = 1;
        var ppn = parseInt($(this).find('option:selected').val(), 10);
        renderPage($bootpag, page, ppn);
        $owner.trigger('page', [page, ppn]);
      });

      me.find('select.bootpage_go_to_page').change(function() {
        var page = parseInt($(this).find('option:selected').val(), 10);
        var ppn = parseInt($owner.find('select.bootpage_per_numbers').find('option:selected').val(), 10);

        if (page <= settings.total && page > 0) {
          renderPage($bootpag, page, ppn);
          $owner.trigger('page', [page, ppn]);
        }
      });

      me.find('input.bootpage_go_to_page').change(function() {
        var page = parseInt($(this).val(), 10);
        var ppn = parseInt($owner.find('select.bootpage_per_numbers').find('option:selected').val(), 10);

        if (page <= settings.total && page > 0) {
          renderPage($bootpag, page, ppn);
          $owner.trigger('page', [page, ppn]);
        }
      });

      renderPage($bootpag, settings.page, settings.currentPerPageNumbers);
    });
  }

})(jQuery, window);
