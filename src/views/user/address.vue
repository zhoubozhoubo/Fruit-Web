<style lang="less" scoped>
    @import './address.less';
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
                        <Button type="info" @click="goBack" icon="ios-arrow-back">{{user.name}}->收货地址</Button>
                        <Button type="primary" @click="alertAdd" icon="md-add">新增</Button>
                        <Button type="error" @click="alertDel" icon="md-close" style="float: right">删除</Button>
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
        <!--表单-->
        <Modal v-model="modalSetting.show" width="668" :styles="{top: '30px'}" @on-visible-change="doCancel">
            <p slot="header" style="color:#2d8cf0;">
                <Icon type="md-information-circle"></Icon>
                <span>{{formItem.id ? '编辑' : '新增'}}地址</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="用户姓名" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入用户姓名"></Input>
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

    // 编辑
    const editButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'primary'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.formItem.id = currentRow.id;
                    vm.formItem.name = currentRow.name;
                    vm.formItem.phone = currentRow.phone;
                    vm.formItem.area = currentRow.area_com;
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
                    axios.get('UserAddressCon/del', {
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
                    margin: '0 5px'
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
        name: 'user_address',
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
                // 用户信息
                user: {
                    id: 0,
                    name: ''
                },
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
                    },
                    {
                        title: '状态',
                        align: 'center',
                        key: 'status',
                        width: 100
                    },
                    {
                        title: '操作',
                        align: 'center',
                        key: 'handle',
                        width: 175,
                        handle: ['edit', 'delete']
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
                    user_id: 0,
                    name: '',
                    phone: '',
                    area: [],
                    comment: '',
                    id: 0
                },
                // 表单验证规则
                ruleValidate: {
                    name: [
                        { required: true, message: '用户姓名不能为空', trigger: 'blur' }
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
                // 地区列表数据
                areaData: []
            };
        },
        components: {
        },
        created () {
            this.user.id = this.$route.params.id.toString();
            this.user.name = this.$route.params.name.toString();
            this.init();
            this.getList();
        },
        methods: {
            // 返回上一页
            goBack () {
                this.$router.back();
            },
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
                                            this.formItem.avatarurl = currentRowData.avatarurl;
                                            this.formItem.name = currentRowData.name;
                                            vm.modalSeeingImg.show = true;
                                        }
                                    }
                                });
                            } else {
                                return h('Tag', {}, '暂无图片');
                            }
                        };
                    }
                    // 状态列
                    if (item.key === 'is_default') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('i-switch', {
                                attrs: {
                                    size: 'large'
                                },
                                props: {
                                    'true-value': 1,
                                    'false-value': 0,
                                    value: currentRowData.is_default
                                },
                                on: {
                                    'on-change': function (status) {
                                        axios.get('UserAddressCon/changeDefault', {
                                            params: {
                                                is_default: status,
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
                                }, '默认'),
                                h('span', {
                                    slot: 'close'
                                }, '否')
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
                                        axios.get('UserAddressCon/changeStatus', {
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
                        let target = 'UserAddressCon/aoe';
                        this.formItem.user_id = this.user.id;
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
            // 搜索
            search () {
                this.tableShow.currentPage = 1;
                this.getList();
            },
            // 获取列表数据
            getList () {
                let vm = this;
                vm.tableLoading = true;
                axios.get('UserAddressCon/index', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        id: vm.user.id,
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
                    axios.get('UserAddressCon/del', {
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
