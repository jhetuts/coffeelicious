"use strict";

(function ($) {
  $.fn.initializeCommentator = function (config) {
    var configs = $.extend({
      apiKey: '',
      authDomain: '',
      projectId: ''
    }, config);

    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: configs.apiKey,
        authDomain: configs.authDomain,
        projectId: configs.projectId
      });
    }
  };

  $.fn.loadCommentator = function (options) {
    var customConfig = {
      name: '',
      pageName: '',
      postId: '',
      postTitle: '',
      userImage: '',
    };
    var settings = $.extend(customConfig, options);
    initiateCommentBox(settings);
  };

  function initiateCommentBox(commentDetails) {
    var db = firebase.firestore();
    db.collection(commentDetails.pageName).doc(commentDetails.postId.toString()).collection("post").orderBy('timestamp').onSnapshot(function (snapshot) {
      if (snapshot.docChanges().length !== -1) {
        snapshot.docChanges().forEach(function (change) {
          var curUser = "";
          var data = change.doc.data();
          var imageSrc = 'http://localhost:8000/image/male-id.png';
          var commentContainer, commentApproved, commentPendingForApproval;

          if(commentDetails.userImage === ''){
            if (data.img_url === "") {
              data.img_url = imageSrc;
            }
          }

          if (commentDetails.name.toString() === data.name.toString()) {
            curUser = "commentator";
            commentPendingForApproval = "\n<p class=\"user-display-image\"><img src=\"".concat(data.img_url, "\"></p>\n<div class=\"user-commentator-details disapproved\">\n<span class=\"user-name\">").concat(data.name, "</span>\n<div class=\"user-commentator\">\n<p class=\"").concat(curUser, "\">").concat(data.comment, "</p>\n<span class=\"commentator-posted-date\">Pending for public display.</span>\n</div>\n</div>\n");
          }

          commentContainer = "<div class=\"user-commentator-box\" id=\"".concat(data._uid, "\" data-timestamp=\"").concat(data.timestamp, "\"></div>");
          commentApproved = "\n<p class=\"user-display-image\"><img src=\"".concat(data.img_url, "\"></p>\n<div class=\"user-commentator-details\">\n    <span class=\"user-name\">").concat(data.name, "</span>\n <div class=\"user-commentator\">\n<p class=\"").concat(curUser, "\">").concat(data.comment, "</p>\n<span class=\"commentator-posted-date\">").concat(data.timestamp, "</span>\n</div>\n</div>\n");

          $("#".concat(commentDetails.postId)).find('.commentator-area').after(commentContainer);

          if (change.type === "added") {
            console.log('added')
            console.log(data);
            if (data.isApproved !== "undefined" && data.isApproved) {
              $("#".concat(data._uid)).append(commentApproved);
              $("#".concat(data._uid)).css('opacity', '1');
            } else {
              $("#".concat(data._uid)).append(commentPendingForApproval);
              $("#".concat(data._uid)).css('opacity', '0.5');
            }
          }

          if (change.type === "modified") {
            console.log(data)
            if ($('body').find("#".concat(data._uid))) {
              $("#".concat(data._uid)).remove();
            }
            if (data.isApproved !== "undefined" && data.isApproved) {
				      console.log(data.isApproved)
              $("#".concat(data._uid)).empty();
              $("#".concat(data._uid)).append(commentApproved);
              $("#".concat(data._uid)).css('opacity', '1');
              $("#".concat(data._uid)).css('margin-bottom', '20px');
            } else {
				      console.log(data.isApproved)
              $("#".concat(data._uid)).empty();
              $("#".concat(data._uid)).append(commentPendingForApproval);
              $("#".concat(data._uid)).css('opacity', '0.5');
            }
          }

          if (change.type === "removed") {
            $("#".concat(data._uid)).remove();
          }

          if($('.user-commentator-box:empty')){
            $('.user-commentator-box:empty').css('margin-bottom', '0');
          }
        });
      }
    });
    addCommentTexBox(commentDetails);
  }

  function addCommentTexBox(commentatorDetails) {
    $("#".concat(commentatorDetails.postId)).append("\n      <div class=\"commentator-area\">\n          <form action=\"#\" id=\"addCommentForm-".concat(commentatorDetails.postId, "\">\n            <textarea id=\"commentator-textarea-").concat(commentatorDetails.postId, "\" class=\"commentator-textarea\" placeholder=\"Your comment\" required></textarea>\n            <span class=\"commentator-arrow\">&#x21AA;</span>\n            <input type=\"submit\" id=\"addComment-").concat(commentatorDetails.postId, "\" value=\"Comment\" class=\"textAreaCommentator\">\n          </form>\n      </div>\n    "));
    $("#commentator-textarea-".concat(commentatorDetails.postId)).each(function () {
      this.setAttribute('style', 'height:' + this.scrollHeight + 'px;overflow-y:hidden;');
    }).bind({
      input: function input(e) {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      }
    });
    $("#addCommentForm-".concat(commentatorDetails.postId)).bind({
      submit: function submit(e) {
        e.preventDefault();
        console.log(e);
        var comment = $("#commentator-textarea-".concat(commentatorDetails.postId)).val();
        var postVal = {
          comment: comment,
          name: commentatorDetails.name,
          img_url: commentatorDetails.userImage
        };

        $.ajax({
          url: 'http://127.0.0.1:8000/comment/' + commentatorDetails.pageName + '/' + commentatorDetails.postId,
          method: 'POST',
          dataType: 'json',
          data: postVal
        }).done(function (res) {
          console.log('Comment will show once approved');
          $("#commentator-textarea-".concat(commentatorDetails.postId)).val("");

          if (res.success == false) {
            alert(res.message);
          }
        });
      }
    });
  }
})(jQuery);