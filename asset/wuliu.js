/**
 * Created by wurui on 17/04/2017.
 */
//http://api.wap.guoguo-app.com/h5/mtop.cnwireless.cnlogisticdetailservice.wapquerylogisticpackagebymailno/1.0/?v=1.0&api=mtop.cnwireless.CNLogisticDetailService.wapqueryLogisticPackageByMailNo&appKey=12574478&t=1492423328842&callback=mtopjsonp2&type=jsonp&sign=394ae4b99a9c10536201ce7cf9e1b45c&data=%7B%22mailNo%22%3A%22433870417266%22%7D
define(['mustache'],function (Mustache) {
    var tplwuliu = '<div class="J_wuliu">' +
        '<dl class="wuliu-detail">' +
        '<dt>{{expTextName}} {{mailNo}} <span class="status">{{statusDesc}}</span></dt>' +

        '{{#data}}' +
        '<dd>' +
        '<span class="time">' +
        '{{time}}' +
        '</span>' +
        '{{context}}' +
        '</dd>' +
        '{{/data}}' +
        '</dl>' +
        '</div>'
    var wuliuStatus = function (st) {
        switch (st - 0) {
            case -1:
                return '待查询'
            case 0:
                return '查询异常'
            case 1:
                return '暂无记录'
            case 2:
                return '在途中'
            case 3:
                return '派送中'
            case 4:
                return '已签收'
            case 5:
                return '用户拒签'
            case 6:
                return '疑难件'
            case 7:
                return '无效单'
            case 8:
                return '超时单'
            case 9:
                return '签收失败'
            case 10:
                return '退回'
        }
    }
    var showWuliu = function (no,fn) {

        var wuliuData = showWuliu.cachedData[no];
        if (!wuliuData) {
            $.getJSON('https://www.shaomachetie.com/smct/wuliu?no='+no+'&callback=?', function (r) {
                //console.log(r);
                showWuliu.cachedData[no] = r;
                showWuliu(no,fn)
            })
        } else {
            var data = wuliuData.data.showapi_res_body;
            data.statusDesc = wuliuStatus(data.status);
            //{"code":0,"error":null,"data":{"showapi_res_code":0,"showapi_res_error":"","showapi_res_body":{"mailNo":"433870417266","update":1492482131386,"updateStr":"2017-04-18 10:22:11","ret_code":0,"flag":true,"status":4,"tel":"021-39777777","expSpellName":"zhongtong","data":[{"time":"2017-04-11 13:36:00","context":"[杭州老余杭] [杭州市] [杭州老余杭]的派件已签收 感谢使用中通快递,期待再次为您服务!"},{"time":"2017-04-11 08:40:07","context":"[杭州老余杭] [杭州市] [杭州老余杭]的方欢欢正在第1次派件 电话:15267435533 请保持电话畅通、耐心等待"},{"time":"2017-04-11 07:02:39","context":"[杭州老余杭] [杭州市] 快件到达 [杭州老余杭]"},{"time":"2017-04-11 00:14:58","context":"[杭州中转部] [嘉兴市] 快件离开 [杭州中转部]已发往[杭州老余杭]"},{"time":"2017-04-10 22:59:52","context":"[杭州中转部] [嘉兴市] 快件到达 [杭州中转部]"},{"time":"2017-04-10 20:43:41","context":"[绍兴中转部] [绍兴市] 快件离开 [绍兴中转部]已发往[杭州中转部]"},{"time":"2017-04-10 20:42:33","context":"[绍兴中转部] [绍兴市] 快件到达 [绍兴中转部]"},{"time":"2017-04-10 18:41:25","context":"[余姚江南] [宁波市] 快件离开 [余姚江南]已发往[杭州]"},{"time":"2017-04-10 18:30:58","context":"[余姚江南] [宁波市] [余姚江南]的詹仁军已收件 电话:18868963161"}],"expTextName":"中通快递"}}}
            fn(Mustache.render(tplwuliu, data))
        }


    };
    showWuliu.cachedData = {};

    return showWuliu;

})