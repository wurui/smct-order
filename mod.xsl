<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:oxm="https://www.openxsl.com">
    <xsl:template match="/root" name="wurui.smct-order">
        <xsl:param name="buildurl"/>
        <!-- className 'J_OXMod' required  -->
        <div class="J_OXMod oxmod-smct-order" ox-mod="smct-order" data-buildurl="{$buildurl}">
            <script type="text/tpl" class="J_tpl"><![CDATA[
            {{#data}}
            <table class="orders-table" cellpadding="0" cellspacing="0" data-id={{_id}}>
            <thead>
                <tr><td>订单时间: {{order_time}}</td><td>{{{statusDesc}}}</td></tr>
            </thead>
            <tbody>
            <tr>
                <td colspan="2">
                {{#pack}}
                <div class="order-item">
                    <div class="snapshot">
                        <div class="preview bgcolor-{{setting.bgcolor}}"">
                        <div class="card-header">{{setting.text1}}</div>
                        <div class="card-body tpl tpl-{{setting.tpl}}">
                            <div class="central">
                                {{#setting.carlogo}}<img src="{{fullcarlogo}}"/>{{/setting.carlogo}}
                            </div>
                            <img src="http://i.oxm1.cc/uploads/git/wurui/img/2ahkwkkveTj1rgh0ueRlcquA5vz-1000.png" class="qrcode"/>
                        </div>
                        <div class="card-footer">
                            <span>{{setting.text2}}</span>
                        </div>
                        </div>
                    </div>
                    &times;{{amount}}
                </div>
                {{/pack}}
                </td>
            </tr>
            </tbody>
        <tfoot>
            <tr>
                <td colspan="2">配送地址: {{address}}</td>
            </tr>
             <tr>
                <td>总数: {{totalcount}}</td>
                <td>
                    实付金额:&nbsp;&nbsp;<b class="price">{{totalsum}}</b>
                </td>
            </tr>
            {{#op}}
             <tr>
                <td colspan="2"><div class="order-op">{{{op}}}</div></td>
            </tr>
            {{/op}}
        </tfoot>
        </table>
        {{/data}}
        ]]>
            </script>


            <div class="J_list list">加载中...</div>
        </div>
    </xsl:template>
</xsl:stylesheet>
