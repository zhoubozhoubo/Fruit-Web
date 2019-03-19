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
                <span>{{formItem.id ? '编辑' : '新增'}}优惠券</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="100">
                <FormItem label="优惠券名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入优惠券名称"></Input>
                </FormItem>
                <FormItem label="满价格" prop="full_money">
                    <Input v-model="formItem.full_money" placeholder="请输入满价格"></Input>
                </FormItem>
                <FormItem label="减价格" prop="reduce_money">
                    <Input v-model="formItem.reduce_money" placeholder="请输入减价格"></Input>
                </FormItem>
                <FormItem label="优惠券描述" prop="describe">
                    <Input v-model="formItem.describe" :autosize="{maxRows: 10, minRows: 4}" type="textarea" placeholder="请输入优惠券描述"></Input>
                </FormItem>
                <FormItem label="期限天数" prop="term">
                    <InputNumber :min="0" v-model="formItem.term"></InputNumber>
                    <Tag color="error" style="margin-left:5px">优惠券期限天数</Tag>
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
                    vm.formItem.full_money = currentRow.full_money;
                    vm.formItem.reduce_money = currentRow.reduce_money;
                    vm.formItem.describe = currentRow.describe;
                    vm.formItem.term = currentRow.term;
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
                    axios.get('CouponCon/del', {
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
        name: 'coupon_list',
        data () {
            // 表单价格验证
            const validateMoney = function (rule, value, callback) {
                let moneyTest = /^(([1-9]\d{0,3})|0)(\.\d{0,2})?$/;
                if (value === '') {
                    return callback(new Error('请输入价格'));
                } else if (!moneyTest.test(value)) {
                    return callback(new Error('请正确输入价格(0~9999.99)'));
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
                        title: '优惠券名称',
                        align: 'left',
                        key: 'name'
                    },
                    {
                        title: '优惠券描述',
                        align: 'left',
                        key: 'describe'
                    },
                    {
                        title: '满价格',
                        align: 'center',
                        key: 'full_money'
                    },
                    {
                        title: '减价格',
                        align: 'center',
                        key: 'reduce_money'
                    },
                    {
                        title: '期限天数',
                        align: 'center',
                        key: 'term',
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
                // 初始化删除确认弹出框
                modalDel: {
                    show: false,
                    loading: false,
                    index: 0
                },
                // 初始化表单数据
                formItem: {
                    name: '',
                    full_money: '',
                    reduce_money: '',
                    describe: '',
                    term: 7,
                    id: 0
                },
                // 表单验证规则
                ruleValidate: {
                    name: [
                        { required: true, message: '优惠券名称不能为空', trigger: 'blur' }
                    ],
                    full_money: [
                        { required: true, message: '满价格不能为空', trigger: 'blur' },
                        { validator: validateMoney, trigger: 'blur' }
                    ],
                    reduce_money: [
                        { required: true, message: '减价格不能为空', trigger: 'blur' },
                        { validator: validateMoney, trigger: 'blur' }
                    ],
                    term: [
                        { required: true, message: '期限天数不能为空', trigger: 'blur', type: 'number' }
                    ]
                },
                // 选中id列表
                idList: ''
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
                                        axios.get('CouponCon/changeStatus', {
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
                        let target = 'CouponCon/aoe';
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
                axios.get('CouponCon/index', {
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
                    axios.get('CouponCon/del', {
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
