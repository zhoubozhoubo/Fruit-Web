<style lang="less" scoped>
    @import './list.less';
</style>
<template>
    <div>
        <Row>
            <Col span="24">
                <Card style="margin-bottom: 10px">
                    <Form inline>
                        <FormItem style="margin-bottom: 0">
                            <Input v-model="searchConf.number" clearable placeholder="请输入订单号"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Input v-model="searchConf.courier_company" clearable placeholder="请输入物流公司"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Input v-model="searchConf.courier_number" clearable placeholder="请输入物流单号"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Input v-model="searchConf.name" clearable placeholder="请输入收货人"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Input v-model="searchConf.phone" clearable placeholder="请输入联系电话"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Select v-model="searchConf.status" clearable placeholder='请选择状态' style="width:100px">
                                <Option :value="1">待支付</Option>
                                <Option :value="2">待发货</Option>
                                <Option :value="3">待收货</Option>
                                <Option :value="4">已完成</Option>
                                <Option :value="5">退款中</Option>
                                <Option :value="6">已退款</Option>
                            </Select>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Button type="primary" @click="search">查询/刷新</Button>
                        </FormItem>
                    </Form>
                </Card>
            </Col>
        </Row>
        <Row>
            <Col span="24">
                <Card>
                    <p slot="title" style="height: 32px">
                        <!--<Button type="primary" @click="alertAdd" icon="md-add">新增</Button>-->
                        <!--<Button type="error" @click="alertDel" icon="md-close" style="float: right">删除</Button>-->
                    </p>
                    <div>
                        <Table highlight-row :loading="tableLoading" :columns="columnsList" :data="tableData" border disabled-hover ref="selection"></Table>
                    </div>
                    <div class="margin-top-15" style="text-align: center">
                        <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                              :page-size="tableShow.pageSize" @on-change="changePage"
                              @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
                    </div>
                </Card>
            </Col>
        </Row>
        <!--表单-->
        <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="md-information-circle"></Icon>
                <span>{{modalSetting.number}} > 发货</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="物流公司" prop="logistics_company_id">
                    <Select v-model="formItem.logistics_company_id">
                        <Option v-for="(logisticsCompany, logisticsCompanyIndex) in logisticsCompanyList" :value="logisticsCompany.id" :key="logisticsCompanyIndex">{{logisticsCompany.name}}</Option>
                    </Select>
                </FormItem>
                <FormItem label="物流单号" prop="logistics_number">
                    <Input v-model="formItem.logistics_number" placeholder="请输入物流单号"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancel" style="margin-right: 8px">取消</Button>
                <Button type="primary" @click="submit" :loading="modalSetting.loading">确定</Button>
            </div>
        </Modal>
        <!--订单商品-->
        <Modal v-model="modalSeeingGoods.show" width="998" :styles="{top: '30px'}">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="md-information-circle"></Icon>
                <span>{{modalSeeingGoods.number}} > 订单商品列表</span>
            </p>
            <div>
                <Table :loading="goodsLoading" :columns="goodsColumns" :data="goodsData" border disabled-hover></Table>
            </div>
            <div class="margin-top-15" style="text-align: center">
                <Page :total="goodsShow.listCount" :current="goodsShow.currentPage"
                      :page-size="goodsShow.pageSize" @on-change="changeGoodsPage"
                      @on-page-size-change="changeGoodsSize" show-elevator show-sizer show-total></Page>
            </div>
            <p slot="footer"></p>
        </Modal>
        <!--查看大图-->
        <Modal :title="ordersGoods.name"
               v-model="modalSeeingImg.show"
               class-name="fl-image-modal"
               @on-visible-change="doCancel">
            <img :src="ordersGoods.img" v-if="modalSeeingImg.show" style="width: 100%">
        </Modal>
    </div>
</template>
<script>
    import axios from 'axios';

    // 发货
    const sendButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'primary'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.getLogisticsCompany();
                    vm.formItem.id = currentRow.id;
                    vm.modalSetting.show = true;
                    vm.modalSetting.number = currentRow.number;
                    vm.modalSetting.index = index;
                }
            }
        }, '发货');
    };

    // 退款
    const refundButton = (vm, h, currentRow, index) => {
        return h('Poptip', {
            props: {
                confirm: true,
                title: '您确定要对该订单退款吗? ',
                transfer: true
            },
            on: {
                'on-ok': () => {
                    axios.get('OrdersCon/refund', {
                        params: {
                            id: currentRow.id,
                            status: 6
                        }
                    }).then(function (response) {
                        currentRow.loading = false;
                        if (response.data.code === 1) {
                            currentRow.status = 6;
                            vm.$Message.success(response.data.msg);
                        } else {
                            vm.$Message.error(response.data.msg);
                        }
                    });
                }
            }
        }, [
            h('Button', {
                style: {
                    margin: '0 5px'
                },
                props: {
                    type: 'error',
                    placement: 'top',
                    loading: currentRow.isDeleting
                }
            }, '退款')
        ]);
    };

    // 查看订单商品
    const goodsButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'info'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.modalSeeingGoods.show = true;
                    vm.modalSeeingGoods.number = currentRow.number;
                    vm.goodsShow.orders_id = currentRow.id;
                    vm.getGoodsList();
                }
            }
        }, '查看');
    };

    export default {
        name: 'goods_list',
        data () {
            return {
                // 初始化表格
                columnsList: [
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center',
                        fixed: 'left'
                    },
                    {
                        title: '订单号',
                        align: 'center',
                        key: 'number',
                        width: 150,
                        fixed: 'left'
                    },
                    {
                        title: '用户姓名',
                        align: 'center',
                        key: 'user_name',
                        width: 120,
                        fixed: 'left'
                    },
                    {
                        title: '订单商品',
                        align: 'center',
                        key: 'goods',
                        width: 120
                    },
                    {
                        title: '商品总价',
                        align: 'center',
                        key: 'goods_money',
                        width: 120
                    },
                    {
                        title: '订单运费',
                        align: 'center',
                        key: 'freight_money',
                        width: 120
                    },
                    {
                        title: '订单总价',
                        align: 'center',
                        key: 'total_money',
                        width: 120
                    },
                    {
                        title: '物流公司',
                        align: 'center',
                        key: 'logistics_company_name',
                        width: 120
                    },
                    {
                        title: '物流单号',
                        align: 'center',
                        key: 'logistics_number',
                        width: 200
                    },
                    {
                        title: '收货人',
                        align: 'center',
                        key: 'orders_name',
                        width: 120
                    },
                    {
                        title: '联系电话',
                        align: 'center',
                        key: 'orders_phone',
                        width: 120
                    },
                    {
                        title: '收货地址',
                        align: 'center',
                        key: 'orders_address',
                        width: 200,
                        tooltip: true
                    },
                    {
                        title: '下单时间',
                        align: 'center',
                        key: 'gmt_create',
                        width: 150
                    },
                    {
                        title: '支付时间',
                        align: 'center',
                        key: 'pay_time',
                        width: 150
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'status',
                        width: 100,
                        fixed: 'right'
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 100,
                        handle: ['edit'],
                        fixed: 'right'
                    }
                ],
                // 初始化订单商品列表
                goodsColumns: [
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '商品名称',
                        align: 'center',
                        key: 'goods_name'
                    },
                    {
                        title: '商品图片',
                        align: 'center',
                        key: 'goods_img'
                    },
                    {
                        title: '商品价格',
                        align: 'center',
                        key: 'goods_money'
                    },
                    {
                        title: '商品数量',
                        align: 'center',
                        key: 'goods_num'
                    },
                    {
                        title: '商品总价',
                        align: 'center',
                        key: 'total_money'
                    }
                ],
                // 表格加载状态
                tableLoading: false,
                // 表格数据
                tableData: [],
                // 表格分页属性
                tableShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0
                },
                // 订单商品表格加载状态
                goodsLoading: false,
                // 订单商品表格数据
                goodsData: [],
                // 订单商品表格分页属性
                goodsShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0,
                    orders_id: 0
                },
                // 初始化搜索
                searchConf: {
                    number: '',
                    courier_company: '',
                    courier_number: '',
                    name: '',
                    phone: '',
                    status: ''
                },
                // 初始化编辑/新增弹出框
                modalSetting: {
                    show: false,
                    number: '',
                    loading: false,
                    index: 0
                },
                // 订单商品弹出框
                modalSeeingGoods: {
                    show: false,
                    number: '',
                    loading: false,
                    index: 0
                },
                // 初始化图片弹出框
                modalSeeingImg: {
                    show: false
                },
                // 初始化图片弹出框
                ordersGoods: {
                    name: '',
                    img: ''
                },
                // 初始化表单数据
                formItem: {
                    logistics_company_id: '',
                    logistics_number: '',
                    status: 3,
                    id: 0
                },
                // 表单验证规则
                ruleValidate: {
                    logistics_company_id: [
                        { required: true, message: '请选择物流公司', trigger: 'change', type: 'number' }
                    ],
                    logistics_number: [
                        { required: true, message: '请输入物流单号', trigger: 'blur' }
                    ]
                },
                // 物流公司列表
                logisticsCompanyList: []
            };
        },
        components: {
        },
        created () {
            this.init();
            this.goodsinit();
            this.getList();
        },
        methods: {
            // 初始化页面
            init () {
                let vm = this;
                this.columnsList.forEach(item => {
                    // 操作列
                    if (item.handle) {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            if (currentRowData.status === 2) {
                                return h('div', [
                                    sendButton(vm, h, currentRowData, param.index)
                                ]);
                            } else if (currentRowData.status === 5) {
                                return h('div', [
                                    refundButton(vm, h, currentRowData, param.index)
                                ]);
                            }
                        };
                    }
                    // 订单商品列
                    if (item.key === 'goods') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [
                                goodsButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                    // 状态列
                    if (item.key === 'status') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            switch (currentRowData.status) {
                                case 1:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'blue'
                                        }
                                    }, '待支付');
                                case 2:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'default'
                                        }
                                    }, '待发货');
                                case 3:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'orange'
                                        }
                                    }, '待收货');
                                case 4:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'green'
                                        }
                                    }, '已完成');
                                case 5:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'red'
                                        }
                                    }, '退款中');
                                    // return h('div', [refundReasonButton(vm, h, currentRowData, param.index)]);
                                case 6:
                                    return h('Tag', {
                                        attrs: {
                                            color: 'purple'
                                        }
                                    }, '已退款');
                                    // return h('div', [refundedReasonButton(vm, h, currentRowData, param.index)]);
                            }
                        };
                    }
                });
                this.getLogisticsCompany();
            },
            // 初始化页面
            goodsinit () {
                let vm = this;
                this.goodsColumns.forEach(item => {
                    // 图片列
                    if (item.key === 'goods_img') {
                        item.render = (h, param) => {
                            let currentRowData = vm.goodsData[param.index];
                            if (currentRowData.goods_img) {
                                return h('img', {
                                    style: {
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        'margin-top': '5px'
                                    },
                                    attrs: {
                                        src: currentRowData.goods_img,
                                        shape: 'square',
                                        size: 'large'
                                    },
                                    on: {
                                        click: (e) => {
                                            vm.ordersGoods.name = currentRowData.goods_name;
                                            vm.ordersGoods.img = currentRowData.goods_img;
                                            vm.modalSeeingImg.show = true;
                                        }
                                    }
                                });
                            } else {
                                return h('Tag', {}, '暂无图片');
                            }
                        };
                    }
                });
            },
            // 获取物流公司数据
            getLogisticsCompany () {
                let self = this;
                axios.get('Common/logisticsCompanyList').then(function (response) {
                    self.logisticsCompanyList = response.data.data;
                });
            },
            // 表单提交
            submit () {
                let self = this;
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        self.modalSetting.loading = true;
                        let target = 'OrdersCon/send';
                        axios.post(target, this.formItem).then(function (response) {
                            if (response.data.code === 1) {
                                self.$Message.success(response.data.msg);
                            } else if (response.data.code === -1) {
                                self.$Message.error(response.data.msg);
                                self.modalSetting.loading = false;
                                return;
                            } else {
                                self.$Message.error(response.data.msg);
                            }
                            self.getList();
                            self.cancel();
                        });
                    }
                });
            },
            // 表单取消
            cancel () {
                this.modalSetting.show = false;
            },
            // 表单取消关闭时触发
            doCancel (data) {
                if (!data) {
                    this.formItem.id = 0;
                    this.$refs['myForm'].resetFields();
                    this.modalSetting.loading = false;
                    this.modalSetting.index = 0;
                }
            },
            // 改变当前页
            changePage (page) {
                this.tableShow.currentPage = page;
                this.getList();
            },
            // 改变分页数据条数
            changeSize (size) {
                this.tableShow.pageSize = size;
                this.getList();
            },
            // 订单商品改变当前页
            changeGoodsPage (page) {
                this.goodsShow.currentPage = page;
                this.getGoodsList();
            },
            // 订单商品改变分页数据条数
            changeGoodsSize (size) {
                this.goodsShow.pageSize = size;
                this.getGoodsList();
            },
            // 搜索
            search () {
                this.tableShow.currentPage = 1;
                this.getList();
            },
            // 获取列表数据
            getList () {
                let vm = this;
                vm.tableLoading = true;
                axios.get('OrdersCon/index', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        number: vm.searchConf.number,
                        courier_company: vm.searchConf.courier_company,
                        courier_number: vm.searchConf.courier_number,
                        name: vm.searchConf.name,
                        phone: vm.searchConf.phone,
                        status: vm.searchConf.status
                    }
                }).then(function (response) {
                    let res = response.data;
                    vm.tableLoading = false;
                    if (res.code === 1) {
                        vm.tableData = res.data.list;
                        vm.tableShow.listCount = res.data.count;
                    } else {
                        if (res.code === -14) {
                            vm.$store.commit('logout', vm);
                            vm.$router.push({
                                name: 'login'
                            });
                        } else {
                            vm.$Message.error(res.msg);
                        }
                    }
                });
            },
            // 获取订单商品列表数据
            getGoodsList () {
                let vm = this;
                vm.goodsLoading = true;
                axios.get('OrdersCon/getGoods', {
                    params: {
                        page: vm.goodsShow.currentPage,
                        size: vm.goodsShow.pageSize,
                        orders_id: vm.goodsShow.orders_id
                    }
                }).then(function (response) {
                    let res = response.data;
                    vm.goodsLoading = false;
                    if (res.code === 1) {
                        vm.goodsData = res.data.list;
                        vm.goodsShow.listCount = res.data.count;
                    } else {
                        if (res.code === -14) {
                            vm.$store.commit('logout', vm);
                            vm.$router.push({
                                name: 'login'
                            });
                        } else {
                            vm.$Message.error(res.msg);
                        }
                    }
                });
            }
        }
    };
</script>
