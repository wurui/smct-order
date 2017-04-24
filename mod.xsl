<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:oxm="https://www.openxsl.com">
    <xsl:template match="/root" name="wurui.smct-order">
        <!-- className 'J_OXMod' required  -->
        <div class="J_OXMod oxmod-smct-order" ox-mod="smct-order">
            <script type="text/tpl" class="J_tpl"><![CDATA[
            {{#data}}
            <table class="orders-table" cellpadding="0" cellspacing="0" data-id={{_id}}>
            <thead>
                <tr><td colspan="2">订单编号: {{order_no}}</td></tr>
                <tr><td colspan="2">订单时间: {{order_time}}</td></tr>
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
                                {{#setting.carlogo}}<img src="http://www.shaomachetie.com/static/smct/img/carlogo/{{setting.carlogo}}.jpg"/>{{/setting.carlogo}}
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
             <tr>

                <td colspan="2">{{{op}}}</td>
            </tr>
        </tfoot>
        </table>
        {{/data}}
        ]]>
            </script>


            <div class="J_list list">加载中...</div>
        </div>
    </xsl:template>
</xsl:stylesheet>
