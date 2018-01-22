<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:oxm="https://www.openxsl.com">
    <xsl:template match="/root" name="wurui.smct-order">
        <xsl:param name="buildurl"/>
        <xsl:param name="payurl"/>
        <!-- className 'J_OXMod' required  -->
        <div class="J_OXMod oxmod-smct-order" ox-mod="smct-order">
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

           
            <xsl:if test="count(data/orders/i) = 0">
                <div class="empty-order">
                    <i class="iconfont">&#xe631;</i>&#160;&#160;<br/>暂无订单,赶紧去定制一个你喜欢的车贴吧~<br/><a href="{$buildurl}">开始定制 &#187;</a><br/><br/>
                </div>
            </xsl:if>
            <div class="J_list list">
                <xsl:variable name="statusCode" select="data/status"/>
                <xsl:for-each select="data/orders/i">
                    <xsl:variable name="status" select="status"/>
                    <xsl:variable name="statusDesc" select="$statusCode/i[code = $status]"/>
                    <xsl:variable name="status_name" select="$statusDesc/name"/>
                    <table class="orders-table" cellpadding="0" cellspacing="0" data-id="{_id}">
                        <thead>
                            <tr>
                                <td>
                                    订单时间: <xsl:value-of select="time/y"/>/<xsl:value-of select="time/M"/>/<xsl:value-of select="time/d"/>
                                    &#160;
                                    <xsl:value-of select="time/H"/>:<xsl:value-of select="time/m"/>:<xsl:value-of select="time/s"/>
                                </td>
                                <td>
                                    <font color="{$statusDesc/color}"><xsl:value-of select="$statusDesc/title"/></font>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td colspan="2">
                            <xsl:for-each select="content/i">
                                <div class="order-item">
                                    <div class="snapshot">
                                        <div class="preview bgcolor-{customize/i[name='bgcolor']/value}">
                                            <div class="card-header">
                                                <xsl:value-of select="customize/i[name='text1']/value"/>
                                            </div>
                                            <div class="card-body tpl tpl-{customize/i[name='tpl']/value}">
                                                <div class="central">
                                                    <img src="http://v.oxm1.cc/cars/{customize/i[name='carlogo']/value}.png"/>
                                                </div>
                                                <img src="http://i.oxm1.cc/uploads/git/wurui/img/2ahkwkkveTj1rgh0ueRlcquA5vz-1000.png" class="qrcode"/>

                                            </div>
                                            <div class="card-footer">
                                                <span>
                                                    <xsl:value-of select="customize/i[name='text2']/value"/>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    &#215;<xsl:value-of select="amount"/>
                                </div>
                            </xsl:for-each>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2">配送地址: <xsl:value-of select="delivery"/></td>
                        </tr>
                         <tr>
                            <td>总数:<xsl:value-of select="totalcount"/></td>
                            <td>
                                实付金额:&#160;&#160;<b class="price"><xsl:value-of select="totalfee"/></b>
                            </td>
                        </tr>
                         <tr>
                            <td colspan="2">
                                
                                <div class="order-op">
                                    <xsl:choose>
                                        <xsl:when test="$status_name = 'new'">
                                            <button data-role="close" type="button">关闭订单</button>&#160;&#160;&#160;&#160;<a href="{$buildurl}?oid={_id}">去付款 &#187;</a>
                                        </xsl:when>
                                        <xsl:when test="$status_name = 'paid'">
                                            <button data-role="refund" type="button">退款</button>
                                        </xsl:when>
                                        
                                        <xsl:when test="$status_name = 'delivered'">
                                            <button data-role="wuliu" data-no="">查看物流</button>
                                        </xsl:when>
                                        
                                        <xsl:when test="$status_name = 'refund_fail'">退款失败,请等待客服处理</xsl:when>
                                        <xsl:when test="$status_name = 'refund_applied'">
                                            <button data-role="cancelrefund" type="button">撤消退款</button>
                                        </xsl:when>
                                        <xsl:when test="$status_name = 'refunded' or $status_name = 'completed' or $status_name = 'closed'">
                                            <button data-role="del" type="button">删除订单</button>
                                        </xsl:when>
                                        <xsl:otherwise>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                    </table>
                </xsl:for-each>
            </div>
            <template ox-refresh="html">
                <div class="J_wuliu">
                    <dl class="wuliu-detail">
                        <dt>
                            <xsl:value-of select="data/package-tracking/company"/>&#160;
                            <xsl:value-of select="data/package-tracking/no"/>&#160;
                            <span class="status"><xsl:value-of select="data/package-tracking/status"/></span>
                        </dt>
                        <xsl:for-each select="data/package-tracking/tracking/i">
                            <dd>
                                <span class="time">
                                    <xsl:value-of select="time/M"/>-<xsl:value-of select="time/d"/>&#160;
                                    <xsl:value-of select="time/H"/>:<xsl:value-of select="format-number(time/m,'00')"/>
                                </span>
                                <xsl:value-of select="desc"/>
                            </dd>
                        </xsl:for-each>
                    </dl>
                </div>
            </template>

        </div>
    </xsl:template>
</xsl:stylesheet>
