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
          perPageNumbers: [10, 20, 50, 100],
          currentPerPageNumbers: null,
          perPageText: '每頁',
          href: 'javascript:void(0);',
          hrefVariable: '{{number}}',
          firstLastUse: true,
          first: '<span aria-hidden="true">&larr;</span>',
          last: '<span aria-hidden="true">&rarr;</span>',
          wrapClass: 'pagination',
          activeClass: 'active',
          disabledClass: 'disabled',
          lastClass: 'last',
          firstClass: 'first'
        },
        $owner.data('settings') || {},
        options || {});

    if (settings.total <= 0)
      return this;

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
      var select_style = 'style="margin: 22px 10px; display: unset; width: auto;"';
      var t = settings.perPageNumbers.length;
      var selectStr = '<div class="bootpag_drop col-md-1">' + settings.perPageText +
        '<select class="bootpage_per_numbers form-control" ' + select_style + '>';
      var optionsStr = '';
      for (var i = 0; i < t; i++) {
        var numbers = settings.perPageNumbers[i];
        optionsStr += '<option value="' + numbers + '">' + numbers + '</option>';
      }

      return selectStr + optionsStr + '</select></div>';
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
        p = ['<ul class="', settings.wrapClass, ' bootpag nav-bootpag">'],
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

      p.push('</ul>');
      me.find('.nav-bootpag').remove();
      me.append(p.join(''));
      me.find('div.bootpag_drop').remove();
      me.append(perPageNumbersView());
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

      renderPage($bootpag, settings.page, settings.currentPerPageNumbers);
    });
  }

})(jQuery, window);
