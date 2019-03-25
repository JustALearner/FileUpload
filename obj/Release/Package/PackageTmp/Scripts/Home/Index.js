
$(function () {

    //1.初始化input控件
    var oFileInput = new FileInput();
    oFileInput.Init("txt_file", "/Home/Upload");

    //2.注册导入按钮的事件
    $("#btn_import").click(function () {
        $("#myModal").modal();
    });

    $("#btn_qrCode").click(function () {
        var getSelectRows = $("#tb_apkInfos").bootstrapTable('getSelections', function (row) {
            return row;
        });
        if (getSelectRows.length === 0) {
            $.MsgBox.Alert("Info", "please select items");
            return;
        }
   
        showTableData(getSelectRows);
//        show(JSON.stringify(getSelectRows));
    
    });
    //1.初始化Table
    var oTable = new TableInit();
    oTable.Init();


    function show() {              
         
        layer.open({
            type:1
//            , title: false //不显示标题栏
            , title: ['QrCode', 'font-size:18px;background-color:#337AB7;color:white']
            , closeBtn: 2
            , area: '500px;'
            , offset: '100px'
            , shade: 0.5
            ,anim: 0
            , id: 'LAY_layuipro' //设定一个id，防止重复弹出
//            , btn: ['Close']
//            , btnAlign: 'c'
            , moveType: 1 //拖拽模式，0或者1
            , content: '<div id="layContent" style=" padding: 50px;text-align:center;  background-color: #393D49; color: #fff; font-weight: 300;"><img src="/Home/ShowImg" style="width:400px;height:400px" /><div  style="margin-top:10px;color:#337AB7;" > <h3> right button and save picture as</h3></div></div>'
//                < div  style="margin-top:10px;color:#409EFF;" > <h3> right button and save picture as</h3></div>
            , success: function (layero) {
//                var btn = layero.find('.layui-layer-btn');
//                btn.find('.layui-layer-btn0').attr({
//                    
//                });
            }
        });
    }


     

    
 

    //自定义给表格赋值的方法，json就是getSelectRows，调用 showTableData(getSelectRows); 即可
    function showTableData(json) {
        console.log(JSON.stringify(json));

//        var form = $("<form>");//定义一个form表单
//        form.attr("style", "display:none");
//        form.attr("target", "");
//        form.attr("method", "post");
//        form.attr("action", "/Home/QrCode");
//        var input1 = $("<input>");
//        input1.attr("type", "hidden");
//        input1.attr("name", "Json");
//        input1.attr("value", JSON.stringify(json));
//        $("body").append(form);//将表单放置在web中
//        form.append(input1);
//        form.submit();//表单提交
//        form.remove();

        $.ajax({
            async: false,
            cache: false,
            type: 'post',
            contentType: "application/json",
            url: "/Home/QrCode", //请求的action路径
            data: JSON.stringify(json),
            error: function () {//请求失败处理函数  
                $.MsgBox.Alert("Error", "Generate Failed");
            },
            success: function (data) { //请求成功后处理函数。  
//                console.log(data.msg);
                show();
              

            }
        });
    }

});



//初始化fileinput
var FileInput = function () {
    var oFile = new Object();

    //初始化fileinput控件（第一次初始化）
    oFile.Init = function (ctrlName, uploadUrl) {
        var control = $('#' + ctrlName);

        //初始化上传控件的样式
        control.fileinput({
            //            language: 'zh', //设置语言
            uploadUrl: uploadUrl, //上传的地址
            allowedFileExtensions: ['apk'],//接收的文件后缀
            showUpload: true, //是否显示上传按钮
            showCaption: false,//是否显示标题
            browseClass: "btn btn-primary", //按钮样式     
            //dropZoneEnabled: false,//是否显示拖拽区域
            //minImageWidth: 50, //图片的最小宽度
            //minImageHeight: 50,//图片的最小高度
            //maxImageWidth: 1000,//图片的最大宽度
            //maxImageHeight: 1000,//图片的最大高度
            //maxFileSize: 0,//单位为kb，如果为0表示不限制文件大小
            //minFileCount: 0,
            maxFileCount: 10,
            enctype: 'multipart/form-data',
            validateInitialCount: true,
            previewFileIcon: "<i class='glyphicon glyphicon-king'></i>",

            //            msgFilesTooMany: "选择上传的文件数量({n}) 超过允许的最大数值{m}！",
        });

        //导入文件上传完成之后的事件
        $("#txt_file").on("fileuploaded", function (event, data, previewId, index) {
            console.log(data.response);
            var rets = data.response;
            if (rets === undefined) {
                //toastr.error('文件格式类型不正确');
                return;
            }
            if (rets.code === 0) {
                $("#tb_apkInfos").bootstrapTable('refresh');
//                $.MsgBox.Alert("Info", "refresh completed");
                
//                $("#txt_file").fileinput('reset');
               $("#txt_file").fileinput("clear");
//                $("#txt_file").fileinput("reset");
//                $('#txt_file').fileinput('refresh');
                $('#txt_file').fileinput('enable');
//                $("#file-case").fileinput('refresh')
                $("#myModal").modal("hide");
            }


        });
        $('#txt_file').on('filepreupload', function (event, data, previewId, index) {
//           $("#txt_file").fileinput("clear");
//            $("#txt_file").fileinput("reset");
//            $('#txt_file').fileinput('refresh');
//            $('#txt_file').fileinput('enable');
        });
    }
    return oFile;
};

var TableInit = function () {
    var oTableInit = new Object();
    //初始化Table
    oTableInit.Init = function () {
        $('#tb_apkInfos').bootstrapTable({
            url: '/Home/GetApkInfos', //请求后台的URL（*）
            method: 'get', //请求方式（*）
            toolbar: '#toolbar', //工具按钮用哪个容器
            striped: true, //是否显示行间隔色
            cache: false, //是否使用缓存，默认为true，所以一般情况下需要设置一下这个属性（*）
            pagination: true, //是否显示分页（*）
            sortable: false, //是否启用排序
            sortOrder: "asc", //排序方式
            //            queryParams: oTableInit.queryParams, //传递参数（*）
            sidePagination: "client", //分页方式：client客户端分页，server服务端分页（*）
            pageNumber: 1, //初始化加载第一页，默认第一页
            pageSize: 10, //每页的记录行数（*）
            pageList: [10, 25, 50, 100], //可供选择的每页的行数（*）
            search: true, //是否显示表格搜索，此搜索是客户端搜索，不会进服务端，所以，个人感觉意义不大
            strictSearch: true,
            showColumns: true, //是否显示所有的列
            showRefresh: true, //是否显示刷新按钮
            minimumCountColumns: 2, //最少允许的列数
            clickToSelect: true, //是否启用点击选中行
            height: 500, //行高，如果没有设置height属性，表格自动根据记录条数觉得表格高度
            uniqueId: "Id", //每一行的唯一标识，一般为主键列
            showToggle: true, //是否显示详细视图和列表视图的切换按钮
            cardView: false, //是否显示详细视图
            detailView: false, //是否显示父子表
            columns: [
                {
                    checkbox: true
                }, {
                    field: 'Name',
                    title: 'Name'
                }, {
                    field: 'Size',
                    title: 'Size'
                }, {
                    field: 'Uri',
                    title: 'URI'
                }, {
                    field: 'EncryptUrl',
                    title: 'EncryptUrl',
                    visible: false
                }, {
                    field: 'UploadDate',
                    title: 'UploadDate'
                }
            ]
        });
    };

    //得到查询的参数
    //    oTableInit.queryParams = function(params) {
    //        var temp = { //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
    //            limit: params.limit, //页面大小
    //            offset: params.offset, //页码
    //            departmentname: $("#txt_search_departmentname").val(),
    //            statu: $("#txt_search_statu").val()
    //        };
    //        return temp;
    //    };
    return oTableInit;
};


(function () {
    $.MsgBox = {
        Alert: function (title, msg) {
            GenerateHtml("alert", title, msg);
            btnOk(); //alert只是弹出消息，因此没必要用到回调函数callback
            btnNo();
        },
        Confirm: function (title, msg, callback) {
            GenerateHtml("confirm", title, msg);
            btnOk(callback);
            btnNo();
        }
    }
    //生成Html
    var GenerateHtml = function (type, title, msg) {
        var _html = "";
        _html += '<div id="mb_box"></div><div id="mb_con"><span id="mb_tit">' + title + '</span>';
        _html += '<a id="mb_ico">x</a><div id="mb_msg">' + msg + '</div><div id="mb_btnbox">';
        if (type === "alert") {
            _html += '<input id="mb_btn_ok" type="button" value="确定" />';
        }
        if (type === "confirm") {
            _html += '<input id="mb_btn_ok" type="button" value="确定" />';
            _html += '<input id="mb_btn_no" type="button" value="取消" />';
        }
        _html += '</div></div>';
        //必须先将_html添加到body，再设置Css样式
        $("body").append(_html);
        //生成Css
        GenerateCss();
    }

    //生成Css
    var GenerateCss = function () {
        $("#mb_box").css({
            width: '100%',
            height: '100%',
            zIndex: '99999',
            position: 'fixed',
            filter: 'Alpha(opacity=60)',
            backgroundColor: 'black',
            top: '0',
            left: '0',
            opacity: '0.6'
        });
        $("#mb_con").css({
            zIndex: '999999',
            width: '400px',
            position: 'fixed',
            backgroundColor: 'White',
            borderRadius: '15px'
        });
        $("#mb_tit").css({
            display: 'block',
            fontSize: '14px',
            color: '#444',
            padding: '10px 15px',
            backgroundColor: '#DDD',
            borderRadius: '15px 15px 0 0',
            borderBottom: '3px solid #009BFE',
            fontWeight: 'bold'
        });
        $("#mb_msg").css({
            padding: '20px',
            lineHeight: '20px',
            borderBottom: '1px dashed #DDD',
            fontSize: '13px'
        });
        $("#mb_ico").css({
            display: 'block',
            position: 'absolute',
            right: '10px',
            top: '9px',
            border: '1px solid Gray',
            width: '18px',
            height: '18px',
            textAlign: 'center',
            lineHeight: '16px',
            cursor: 'pointer',
            borderRadius: '12px',
            fontFamily: '微软雅黑'
        });
        $("#mb_btnbox").css({
            margin: '15px 0 10px 0',
            textAlign: 'center'
        });
        $("#mb_btn_ok,#mb_btn_no").css({
            width: '85px',
            height: '30px',
            color: 'white',
            border: 'none'
        });
        $("#mb_btn_ok").css({
            backgroundColor: '#168bbb'
        });
        $("#mb_btn_no").css({
            backgroundColor: 'gray',
            marginLeft: '20px'
        });
        //右上角关闭按钮hover样式
        $("#mb_ico").hover(function () {
            $(this).css({
                backgroundColor: 'Red',
                color: 'White'
            });
        }, function () {
            $(this).css({
                backgroundColor: '#DDD',
                color: 'black'
            });
        });
        var _widht = document.documentElement.clientWidth; //屏幕宽
        var _height = document.documentElement.clientHeight; //屏幕高
        var boxWidth = $("#mb_con").width();
        var boxHeight = $("#mb_con").height();
        //让提示框居中
        $("#mb_con").css({
            top: (_height - boxHeight) / 2 + "px",
            left: (_widht - boxWidth) / 2 + "px"
        });
    }
    //确定按钮事件
    var btnOk = function (callback) {
        $("#mb_btn_ok").click(function () {
            $("#mb_box,#mb_con").remove();
            if (typeof (callback) === 'function') {
                callback();
            }
        });
    }
    //取消按钮事件
    var btnNo = function () {
        $("#mb_btn_no,#mb_ico").click(function () {
            $("#mb_box,#mb_con").remove();
        });
    }
})();