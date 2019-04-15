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
                            <Input v-model="searchConf.name" clearable placeholder="请输入名称"></Input>
                        </FormItem>
                        <FormItem style="margin-bottom: 0">
                            <Select v-model="searchConf.status" clearable placeholder='请选择状态' style="width:100px">
                                <Option :value="1">启用</Option>
                                <Option :value="0">禁用</Option>
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
                        <Table highlight-row :loading="tableLoading" :columns="columnsList" :data="tableData" border disabled-hover  @on-selection-change="handleRowChange" ref="selection"></Table>
                    </div>
                    <div class="margin-top-15" style="text-align: center">
                        <Page :total="tableShow.listCount" :current="tableShow.currentPage"
                              :page-size="tableShow.pageSize" @on-change="changePage"
                              @on-page-size-change="changeSize" show-elevator show-sizer show-total></Page>
                    </div>
                </Card>
            </Col>
        </Row>
        <!--收货地址列表-->
        <Modal v-model="modalSeeingAddress.show" width="998" :styles="{top: '30px'}">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="md-information-circle"></Icon>
                <span>{{modalSeeingAddress.name}} > 收货地址列表</span>
            </p>
            <div>
                <Table :loading="addressLoading" :columns="addressColumns" :data="addressData" border disabled-hover></Table>
            </div>
            <div class="margin-top-15" style="text-align: center">
                <Page :total="addressShow.listCount" :current="addressShow.currentPage"
                      :page-size="addressShow.pageSize" @on-change="changeAddressPage"
                      @on-page-size-change="changeAddressSize" show-elevator show-sizer show-total></Page>
            </div>
            <p slot="footer"></p>
        </Modal>
        <!--优惠券列表-->
        <Modal v-model="modalSeeingCoupon.show" width="998" :styles="{top: '30px'}">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="md-information-circle"></Icon>
                <span>{{modalSeeingCoupon.name}} > 优惠券列表</span>
            </p>
            <div>
                <Table :loading="couponLoading" :columns="couponColumns" :data="couponData" border disabled-hover></Table>
            </div>
            <div class="margin-top-15" style="text-align: center">
                <Page :total="couponShow.listCount" :current="couponShow.currentPage"
                      :page-size="couponShow.pageSize" @on-change="changeCouponPage"
                      @on-page-size-change="changeCouponSize" show-elevator show-sizer show-total></Page>
            </div>
            <p slot="footer"></p>
        </Modal>
        <!--表单-->
        <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="md-information-circle"></Icon>
                <span>{{formItem.id ? '编辑' : '新增'}}用户</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="用户头像" prop="avatarurl">
                    <div class="demo-upload-list" v-if="formItem.avatarurl">
                        <img :src="formItem.avatarurl">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="handleView()"></Icon>
                            <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.avatarurl" v-model="formItem.avatarurl" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.avatarurl"
                            :format="['jpg','jpeg','png']"
                            :max-size="5120"
                            :on-success="handleImgSuccess"
                            :on-format-error="handleImgFormatError"
                            :on-exceeded-size="handleImgMaxSize"
                            style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="ios-camera" size="20"></Icon>
                        </div>
                    </Upload>
                    <Modal title="View Image" v-model="visible">
                        <img :src="formItem.avatarurl" v-if="visible" style="width: 100%">
                    </Modal>
                </FormItem>
                <FormItem label="用户姓名" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入用户姓名"></Input>
                </FormItem>
                <FormItem label="用户昵称" prop="nickname">
                    <Input v-model="formItem.nickname" placeholder="请输入用户昵称"></Input>
                </FormItem>
                <FormItem label="用户电话" prop="phone">
                    <Input v-model="formItem.phone" placeholder="请输入用户电话"></Input>
                </FormItem>
                <FormItem label="用户地区" prop="area">
                    <Cascader v-model="formItem.area" :data="areaData" change-on-select></Cascader>
                </FormItem>
                <FormItem label="详细地址" prop="comment">
                    <Input v-model="formItem.comment" placeholder="请输入详细地址"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancel" style="margin-right: 8px">取消</Button>
                <Button type="primary" @click="submit" :loading="modalSetting.loading">确定</Button>
            </div>
        </Modal>
        <!--查看大图-->
        <Modal :title="formItem.name"
               v-model="modalSeeingImg.show"
               class-name="fl-image-modal"
               @on-visible-change="doCancel">
            <img :src="formItem.avatarurl" v-if="modalSeeingImg.show" style="width: 100%">
        </Modal>
        <!--删除确认-->
        <Modal v-model="modalDel.show"
               @on-ok="delAll">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="ios-information-circle"></Icon>
                <span>删除确认</span>
            </p>
            <div style="text-align:center">
                <p>删除后不可恢复，确定删除选中数据吗？</p>
            </div>
        </Modal>
    </div>
</template>
<script>
    import axios from 'axios';
    import config from '../../../build/config';

    // 收货地址
    const addressButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'info'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.modalSeeingAddress.show = true;
                    vm.modalSeeingAddress.name = currentRow.name;
                    vm.addressShow.user_id = currentRow.id;
                    vm.getAddressList();
                }
            }
        }, '收货地址');
    };

    // 优惠券
    const couponButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'success'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.modalSeeingCoupon.show = true;
                    vm.modalSeeingCoupon.name = currentRow.name;
                    vm.couponShow.user_id = currentRow.id;
                    vm.getCouponList();
                }
            }
        }, '优惠券');
    };

    // 编辑
    const editButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'primary'
            },
            style: {
                margin: '5px'
            },
            on: {
                'click': () => {
                    vm.formItem.id = currentRow.id;
                    vm.formItem.avatarurl = currentRow.avatarurl;
                    vm.formItem.name = currentRow.name;
                    vm.formItem.nickname = currentRow.nickname;
                    vm.formItem.phone = currentRow.phone;
                    vm.formItem.area = currentRow.area;
                    vm.formItem.comment = currentRow.comment;
                    vm.modalSetting.show = true;
                    vm.modalSetting.index = index;
                }
            }
        }, '编辑');
    };

    // 删除
    const deleteButton = (vm, h, currentRow, index) => {
        return h('Poptip', {
            props: {
                confirm: true,
                title: '您确定要删除这条数据吗? ',
                transfer: true
            },
            on: {
                'on-ok': () => {
                    axios.get('UserCon/del', {
                        params: {
                            id: currentRow.id
                        }
                    }).then(function (response) {
                        currentRow.loading = false;
                        if (response.data.code === 1) {
                            vm.tableData.splice(index, 1);
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
                    margin: '5px'
                },
                props: {
                    type: 'error',
                    placement: 'top',
                    loading: currentRow.isDeleting
                }
            }, '删除')
        ]);
    };

    export default {
        name: 'user_list',
        data () {
            // 表单电话验证
            const validatePhone = function (rule, value, callback) {
                let phoneTest = /^1[34578]\d{9}$/;
                if (value === '') {
                    return callback(new Error('请输入电话'));
                } else if (!phoneTest.test(value)) {
                    return callback(new Error('请正确输入电话'));
                } else {
                    callback();
                }
            };
            // 表单地区验证
            const validateArea = (rule, value, callback) => {
                if (value.length === 0) {
                    callback(new Error('请选择地区'));
                } else {
                    callback();
                }
            };
            return {
                // 初始化表格
                columnsList: [
                    {
                        type: 'selection',
                        width: 50,
                        align: 'center',
                        key: 'id'
                    },
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '微信昵称',
                        align: 'center',
                        key: 'nickname',
                        width: 200
                    },
                    {
                        title: '微信头像',
                        align: 'center',
                        key: 'avatarurl',
                        width: 120
                    },
                    {
                        title: '用户姓名',
                        align: 'center',
                        key: 'name',
                        width: 150
                    },
                    {
                        title: '用户电话',
                        align: 'center',
                        key: 'phone',
                        width: 120
                    },
                    {
                        title: '用户地址',
                        align: 'center',
                        key: 'area_com'
                    },
                    {
                        title: '注册时间',
                        align: 'center',
                        key: 'gmt_create',
                        width: 150
                    },
                    {
                        title: '收货地址',
                        align: 'center',
                        key: 'address',
                        width: 120
                    },
                    {
                        title: '优惠券',
                        align: 'center',
                        key: 'coupon',
                        width: 110
                    }
                    // {
                    //     title: '状态',
                    //     align: 'center',
                    //     key: 'status',
                    //     width: 100
                    // },
                    // {
                    //     title: '操作',
                    //     align: 'center',
                    //     key: 'handle',
                    //     width: 175,
                    //     handle: ['edit', 'delete']
                    // }
                ],
                // 初始化收货地址列表
                addressColumns: [
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '用户姓名',
                        align: 'center',
                        key: 'name'
                    },
                    {
                        title: '用户电话',
                        align: 'center',
                        key: 'phone'
                    },
                    {
                        title: '省',
                        align: 'center',
                        key: 'province'
                    },
                    {
                        title: '市',
                        align: 'center',
                        key: 'city'
                    },
                    {
                        title: '县',
                        align: 'center',
                        key: 'area'
                    },
                    {
                        title: '详细地址',
                        align: 'center',
                        key: 'comment'
                    },
                    {
                        title: '默认',
                        align: 'center',
                        key: 'is_default',
                        width: 100
                    }
                ],
                // 初始化优惠券列表
                couponColumns: [
                    {
                        title: '序号',
                        type: 'index',
                        width: 65,
                        align: 'center'
                    },
                    {
                        title: '优惠券名称',
                        align: 'left',
                        key: 'coupon_name'
                    },
                    {
                        title: '优惠券期限天数',
                        align: 'center',
                        key: 'coupon_term'
                    },
                    {
                        title: '开始日期',
                        align: 'center',
                        key: 'start'
                    },
                    {
                        title: '截止日期',
                        align: 'center',
                        key: 'end'
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'is_use',
                        width: 100
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
                // 收货地址表格加载状态
                addressLoading: false,
                // 收货地址表格数据
                addressData: [],
                // 收货地址表格分页属性
                addressShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0,
                    user_id: 0
                },
                // 优惠券表格加载状态
                couponLoading: false,
                // 优惠券表格数据
                couponData: [],
                // 优惠券表格分页属性
                couponShow: {
                    currentPage: 1,
                    pageSize: 10,
                    listCount: 0,
                    user_id: 0
                },
                // 初始化搜索
                searchConf: {
                    name: '',
                    status: ''
                },
                // 初始化编辑/新增弹出框
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                // 收货地址弹出框
                modalSeeingAddress: {
                    show: false,
                    name: '',
                    loading: false,
                    index: 0
                },
                // 优惠券弹出框
                modalSeeingCoupon: {
                    show: false,
                    name: '',
                    loading: false,
                    index: 0
                },
                // 初始化图片弹出框
                modalSeeingImg: {
                    show: false
                },
                // 初始化删除确认弹出框
                modalDel: {
                    show: false,
                    loading: false,
                    index: 0
                },
                // 初始化表单数据
                formItem: {
                    avatarurl: '',
                    name: '',
                    nickname: '',
                    phone: '',
                    area: [],
                    comment: '',
                    id: 0
                },
                // 表单验证规则
                ruleValidate: {
                    avatarurl: [
                        { required: true, message: '请上传用户头像', trigger: 'change' }
                    ],
                    name: [
                        { required: true, message: '用户姓名不能为空', trigger: 'blur' }
                    ],
                    nickname: [
                        { required: true, message: '用户昵称不能为空', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '用户电话不能为空', trigger: 'blur' },
                        { validator: validatePhone, trigger: 'blur' }
                    ],
                    area: [
                        { required: true, message: '请选择地区', trigger: 'blur', type: 'array' },
                        { validator: validateArea, trigger: 'change' }
                    ]
                },
                // 选中id列表
                idList: '',
                // 编辑/添加弹窗中显示大图
                visible: false,
                // 上传地址
                uploadUrl: '',
                // 上传头部信息
                uploadHeader: {},
                // 地区列表数据
                areaData: []
            };
        },
        components: {
        },
        created () {
            this.init();
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
                            return h('div', [
                                editButton(vm, h, currentRowData, param.index),
                                deleteButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                    // 图片列
                    if (item.key === 'avatarurl') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            if (currentRowData.avatarurl) {
                                return h('img', {
                                    style: {
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        'margin-top': '5px'
                                    },
                                    attrs: {
                                        src: currentRowData.avatarurl,
                                        shape: 'square',
                                        size: 'large'
                                    },
                                    on: {
                                        click: (e) => {
                                            vm.formItem.avatarurl = currentRowData.avatarurl;
                                            vm.formItem.name = currentRowData.name;
                                            vm.modalSeeingImg.show = true;
                                        }
                                    }
                                });
                            } else {
                                return h('Tag', {}, '暂无图片');
                            }
                        };
                    }
                    // 收货地址列
                    if (item.key === 'address') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [
                                addressButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                    // 优惠券列
                    if (item.key === 'coupon') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [
                                couponButton(vm, h, currentRowData, param.index)
                            ]);
                        };
                    }
                    // 状态列
                    if (item.key === 'status') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('i-switch', {
                                attrs: {
                                    size: 'large'
                                },
                                props: {
                                    'true-value': 1,
                                    'false-value': 0,
                                    value: currentRowData.status
                                },
                                on: {
                                    'on-change': function (status) {
                                        axios.get('UserCon/changeStatus', {
                                            params: {
                                                status: status,
                                                id: currentRowData.id
                                            }
                                        }).then(function (response) {
                                            let res = response.data;
                                            if (res.code === 1) {
                                                vm.$Message.success(res.msg);
                                            } else {
                                                if (res.code === -14) {
                                                    vm.$store.commit('logout', vm);
                                                    vm.$router.push({
                                                        name: 'login'
                                                    });
                                                } else {
                                                    vm.$Message.error(res.msg);
                                                    vm.getList();
                                                }
                                            }
                                            vm.cancel();
                                        });
                                    }
                                }
                            }, [
                                h('span', {
                                    slot: 'open'
                                }, '启用'),
                                h('span', {
                                    slot: 'close'
                                }, '禁用')
                            ]);
                        };
                    }
                });
                // 初始化收货地址表格
                this.addressColumns.forEach(item => {
                    // 默认列
                    if (item.key === 'is_default') {
                        item.render = (h, param) => {
                            let currentRowData = vm.addressData[param.index];
                            if (currentRowData.is_default === 1) {
                                return h('Tag', {
                                    attrs: {
                                        color: 'green'
                                    }
                                }, '默认');
                            } else {
                                return h('Tag', {
                                    attrs: {
                                        color: 'default'
                                    }
                                }, '否');
                            }
                        };
                    }
                });
                // 初始化优惠券表格
                this.couponColumns.forEach(item => {
                    // 状态列
                    if (item.key === 'is_use') {
                        item.render = (h, param) => {
                            let currentRowData = vm.couponData[param.index];
                            if (currentRowData.is_use === 0) {
                                return h('Tag', {
                                    attrs: {
                                        color: 'green'
                                    }
                                }, '未使用');
                            } else if (currentRowData.is_use === 1) {
                                return h('Tag', {
                                    attrs: {
                                        color: 'blue'
                                    }
                                }, '已使用');
                            } else if (currentRowData.is_use === 2) {
                                return h('Tag', {
                                    attrs: {
                                        color: 'default'
                                    }
                                }, '已失效');
                            }
                        };
                    }
                });
                this.uploadUrl = config.baseUrl + 'Index/upload';
                this.uploadHeader = {'ApiAuth': sessionStorage.getItem('apiAuth')};
                this.getArea();
            },
            // 获取地区数据
            getArea () {
                let self = this;
                axios.get('Common/area').then(function (response) {
                    self.areaData = response.data.data;
                });
            },
            // 新增数据弹出框
            alertAdd () {
                this.modalSetting.show = true;
            },
            // 删除数据弹出框
            alertDel () {
                this.modalDel.show = true;
            },
            // 表单提交
            submit () {
                let self = this;
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        self.modalSetting.loading = true;
                        let target = 'UserCon/aoe';
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
            // 收货地址改变当前页
            changeAddressPage (page) {
                this.addressShow.currentPage = page;
                this.getAddressList();
            },
            // 收货地址改变分页数据条数
            changeAddressSize (size) {
                this.addressShow.pageSize = size;
                this.getAddressList();
            },
            // 收货地址改变当前页
            changeCouponPage (page) {
                this.couponShow.currentPage = page;
                this.getCouponList();
            },
            // 收货地址改变分页数据条数
            changeCouponSize (size) {
                this.couponShow.pageSize = size;
                this.getCouponList();
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
                axios.get('UserCon/index', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        name: vm.searchConf.name,
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
            // 获取收货地址列表数据
            getAddressList () {
                let vm = this;
                vm.addressData = [];
                vm.addressLoading = true;
                axios.get('UserCon/getAddress', {
                    params: {
                        page: vm.addressShow.currentPage,
                        size: vm.addressShow.pageSize,
                        user_id: vm.addressShow.user_id
                    }
                }).then(function (response) {
                    let res = response.data;
                    vm.addressLoading = false;
                    if (res.code === 1) {
                        vm.addressData = res.data.list;
                        vm.addressShow.listCount = res.data.count;
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
            // 获取优惠券列表数据
            getCouponList () {
                let vm = this;
                vm.couponData = [];
                vm.couponLoading = true;
                axios.get('UserCon/getCoupon', {
                    params: {
                        page: vm.couponShow.currentPage,
                        size: vm.couponShow.pageSize,
                        user_id: vm.couponShow.user_id
                    }
                }).then(function (response) {
                    let res = response.data;
                    vm.couponLoading = false;
                    if (res.code === 1) {
                        vm.couponData = res.data.list;
                        vm.couponShow.listCount = res.data.count;
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
            // 上传图片一系列
            handleView () {
                this.visible = true;
            },
            handleImgRemove () {
                this.formItem.avatarurl = '';
            },
            handleImgFormatError (file) {
                this.$Notice.warning({
                    title: '文件类型不合法',
                    desc: file.name + '的文件类型不正确，请上传jpg或者png图片。'
                });
            },
            handleImgMaxSize (file) {
                this.$Notice.warning({
                    title: '文件大小不合法',
                    desc: file.name + '太大啦请上传小于5M的文件。'
                });
            },
            handleImgSuccess (response) {
                if (response.code === 1) {
                    this.$Message.success(response.msg);
                    this.formItem.avatarurl = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            },
            // 选中删除id列表
            handleRowChange (selection) {
                this.idList = '';
                for (var i = 0; i < selection.length; i++) {
                    this.idList += selection[i].id + ',';
                }
                this.idList = this.idList.substr(0, this.idList.length - 1);
            },
            // 批量删除
            delAll () {
                let vm = this;
                if (this.idList.length === 0) {
                    vm.$Message.error('请选择要删除的数据');
                    vm.cancel();
                } else {
                    axios.get('UserCon/del', {
                        params: {
                            id: vm.idList
                        }
                    }).then(function (response) {
                        if (response.data.code === 1) {
                            vm.$Message.success(response.data.msg);
                        } else if (response.data.code === -12) {
                            vm.$Message.error(response.data.msg);
                            return;
                        } else {
                            vm.$Message.error(response.data.msg);
                        }
                        vm.getList();
                        vm.cancel();
                    });
                }
            }
        }
    };
</script>
