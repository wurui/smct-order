define(['require', 'zepto',  'oxjs'], function (require, undef, OXJS) {


    
   

    return {
        init: function ($mod) {

            var $wuliuTemplate=$('template',$mod);
            var showWuliu = function ($tar) {
                var wldiv = $('.J_wuliu', $tar.parent());
                if ($tar.attr('data-wuliu') == 'open') {

                    $tar.html('查看物流')
                    wldiv.hide();
                    $tar.attr('data-wuliu', 'close')
                } else {

                    $tar.attr('data-wuliu', 'open')
                    if (wldiv.length) {
                        wldiv.show();
                        $tar.html('收起物流');
                    } else {
                        var no = $tar.attr('data-no');
                        $wuliuTemplate.OXRefresh({
                            'package-tracking':{
                                no:no
                            }
                        },function(){
                            $tar.parent().append($wuliuTemplate.html());
                            $tar.html('收起物流');

                        })
                        
                                /*
                        require(['./wuliu'], function (wuliu) {
                            wuliu(no, function (html) {
                                $tar.parent().append(html);
                                $tar.html('收起物流');
                            });
                        })*/
                    }

                }

            };

/*
            var StatusCodes={};
            $mod.OXGet({
                status:{}
            },function(r){
                var status=r && r.status;
                if(status && status.length){
                    for(var i=0;i<status.length;i++){
                        StatusCodes[status[i].name]=status[i].code;

                    }

                }
            })
            */

            var $list = $('.J_list', $mod).on('click', function (e) {
                var tar = e.target,
                    $tar = $(tar),
                    role = $tar.attr('data-role'),
                    _id = $tar.closest('table').attr('data-id');
                switch (role) {
                    case 'del':
                        if (confirm('确认删除此订单?\r\n订单列表中将无法看到此订单')) {
                            $mod.OXDelete({
                                orders:{_id: _id,$deleter:'default'}
                            }, function (r) {
                                $mod.OXRefresh()
                            });
                        }
                        break
                    case 'close':
                        if (confirm('确认关闭此订单?\r\n如有需要请重新提交新订单')) {
                            $mod.OXPut({
                                orders:{
                                    _id: _id,
                                    //status: StatusCodes.closed
                                    $updater:role
                                }
                                
                            }, function (r) {
                            //$.getJSON(apiHost + '/smct/delorder?_id=' + _id + '&callback=?', function (r) {

                                $mod.OXRefresh()
                            });
                        }

                        break
                    case 'cancelrefund':

                        if (confirm('确认取消退款?\r\n订单将恢复到已付款状态,商家将继续跟进处理')) {
                            
                            $mod.OXPut({
                                orders:{
                                    _id: _id,
                                    //status: StatusCodes.paid
                                    $updater:role
                                }
                                
                            }, function (r) {
                            //$.getJSON(apiHost + '/smct/cancelrefund?_id=' + _id + '&callback=?', function (r) {
                                $mod.OXRefresh()
                            });
                        }


                        break
                    case 'refund':
                        if (confirm('确认退款?')) {
                            

                            $mod.OXPut({
                                orders:{
                                    _id: _id,
                                    //status: StatusCodes.refund_applied
                                    $updater:role
                                }
                            }, function (r) {

                                //$.getJSON(apiHost + '/smct/refund?_id='+_id+'&reason=h5_none&callback=?', function (r) {

                                if (r.code == 0) {
                                    alert('退款申请已经提交,请等待后台处理。\n一般24小时内会处理完成,请注意查收退款')
                                    $mod.OXRefresh()
                                } else {
                                    alert(r.error || r.message)
                                }
                            });
                        }

                        break
                    case 'confirm':
                            $mod.OXPut({
                                orders:{
                                    _id: _id,
                                    //status: StatusCodes.completed
                                    $updater:role
                                }
                            }, function (r) {

                                $mod.OXRefresh()
                            });
                        break
                    case 'wuliu':
                        showWuliu($tar);
                        break
                }

            }).on('change', function (e) {

            })

        }
    }
})
