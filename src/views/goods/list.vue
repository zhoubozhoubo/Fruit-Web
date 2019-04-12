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
                            <Select v-model="searchConf.type_id" clearable placeholder="请选择类型" style="width:100px">
                                <Option v-for="(type, typeIndex) in typeList" :value="type.id" :key="typeIndex">{{type.name}}</Option>
                            </Select>
                        </FormItem>
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
                <span>{{formItem.id ? '编辑' : '新增'}}商品</span>
            </p>
            <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="80">
                <FormItem label="商品类型" prop="type_id">
                    <Select v-model="formItem.type_id" style="width:200px">
                        <Option v-for="(type, typeIndex) in typeList" :value="type.id" :key="typeIndex">{{type.name}}</Option>
                    </Select>
                    <Button icon="md-refresh" @click="getGoodsType"></Button>
                </FormItem>
                <FormItem label="商品名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入商品名称"></Input>
                </FormItem>
                <FormItem label="商品封面" prop="img">
                    <div class="demo-upload-list" v-if="formItem.img">
                        <img :src="formItem.img">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="handleView()"></Icon>
                            <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                        </div>
                    </div>
                    <input v-if="formItem.img" v-model="formItem.img" type="hidden" name="image">
                    <Upload type="drag"
                            :action="uploadUrl"
                            :headers="uploadHeader"
                            v-if="!formItem.img"
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
                        <img :src="formItem.img" v-if="visible" style="width: 100%">
                    </Modal>
                </FormItem>
                <FormItem label="商品简介" prop="describe">
                    <Input v-model="formItem.describe" :autosize="{maxRows: 5, minRows: 2}" type="textarea" placeholder="请输入商品简介"></Input>
                </FormItem>
                <FormItem label="商品价格" prop="money">
                    <Input v-model="formItem.money" placeholder="请输入商品价格"></Input>
                </FormItem>
                <FormItem label="商品原价" prop="original_money">
                    <Input v-model="formItem.original_money" placeholder="请输入商品原价格"></Input>
                </FormItem>
                <FormItem label="商品运费" prop="other_money">
                    <Input v-model="formItem.other_money" placeholder="请输入商品运费"></Input>
                </FormItem>
                <FormItem style="height: 400px;" label="商品详情" prop="comment">
                    <quill-editor
                            style="height: 300px;"
                            v-model="formItem.comment"
                            ref="myQuillEditor"
                            :options="editorOption"
                            @blur="onEditorBlur($event)" @focus="onEditorFocus($event)"
                            @change="onEditorChange($event)">
                    </quill-editor>
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
            <img :src="formItem.img" v-if="modalSeeingImg.show" style="width: 100%">
        </Modal>
        <!--查看详情-->
        <Modal v-model="modalSeeingCon.show"
               :title="formItem.name"
               width="1000"
               :styles="{top: '30px'}"
               @on-visible-change="doCancel">
            <div v-html="formItem.comment"></div>
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
    import {quillEditor} from 'vue-quill-editor';
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';

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
                    vm.formItem.type_id = currentRow.type_id;
                    vm.formItem.img = currentRow.img;
                    vm.formItem.name = currentRow.name;
                    vm.formItem.describe = currentRow.describe;
                    vm.formItem.money = currentRow.money;
                    vm.formItem.original_money = currentRow.original_money;
                    vm.formItem.other_money = currentRow.other_money;
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
                    axios.get('GoodsCon/del', {
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

    // 查看详情
    const seeButton = (vm, h, currentRow, index) => {
        return h('Button', {
            props: {
                type: 'success',
                size: 'small'
            },
            style: {
                margin: '0 5px'
            },
            on: {
                'click': () => {
                    vm.formItem.name = currentRow.name;
                    vm.formItem.comment = currentRow.comment;
                    vm.modalSeeingCon.show = true;
                }
            }
        }, '查看');
    };

    export default {
        name: 'goods_list',
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
                        title: '商品封面',
                        align: 'center',
                        key: 'img',
                        width: 120
                    },
                    {
                        title: '商品名称',
                        align: 'left',
                        key: 'name'
                    },
                    {
                        title: '商品简介',
                        align: 'left',
                        key: 'describe'
                    },
                    {
                        title: '商品类型',
                        align: 'center',
                        key: 'type_name',
                        width: 120
                    },
                    {
                        title: '商品价格',
                        align: 'center',
                        key: 'money',
                        width: 120
                    },
                    {
                        title: '商品原价',
                        align: 'center',
                        key: 'original_money',
                        width: 120
                    },
                    {
                        title: '商品运费',
                        align: 'center',
                        key: 'other_money',
                        width: 120
                    },
                    {
                        title: '商品销量',
                        align: 'center',
                        key: 'number',
                        width: 100
                    },
                    {
                        title: '商品详情',
                        align: 'center',
                        key: 'comment',
                        width: 100
                    },
                    {
                        title: '推荐',
                        align: 'center',
                        key: 'recommend',
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
                    type_id: '',
                    name: '',
                    status: ''
                },
                // 初始化编辑/新增弹出框
                modalSetting: {
                    show: false,
                    loading: false,
                    index: 0
                },
                // 初始化详情弹出框
                modalSeeingCon: {
                    show: false
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
                    type_id: '',
                    name: '',
                    describe: '',
                    img: '',
                    money: '',
                    original_money: '',
                    other_money: '',
                    comment: '',
                    id: 0
                },
                // 表单验证规则
                ruleValidate: {
                    type_id: [
                        { required: true, message: '请选择商品类型', trigger: 'change', type: 'number' }
                    ],
                    name: [
                        { required: true, message: '商品名称不能为空', trigger: 'blur' }
                    ],
                    describe: [
                        { required: true, message: '商品简介不能为空', trigger: 'blur' }
                    ],
                    money: [
                        { required: true, message: '商品价格不能为空', trigger: 'blur' },
                        { validator: validateMoney, trigger: 'blur' }
                    ],
                    original_money: [
                        { required: true, message: '商品原价格不能为空', trigger: 'blur' },
                        { validator: validateMoney, trigger: 'blur' }
                    ],
                    other_money: [
                        { required: true, message: '商品运费不能为空', trigger: 'blur' },
                        { validator: validateMoney, trigger: 'blur' }
                    ],
                    img: [
                        { required: true, message: '请上传商品封面', trigger: 'change' }
                    ]
                },
                // 商品类型
                typeList: [],
                // 选中id列表
                idList: '',
                // 编辑/添加弹窗中显示大图
                visible: false,
                // 上传地址
                uploadUrl: '',
                // 上传头部信息
                uploadHeader: {},
                // 初始化富文本编辑器
                editorOption: {
                    modules: {
                        toolbar: [
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'clean'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{'list': 'ordered'}, { 'list': 'bullet' }],
                            [{'script': 'sub'}, { 'script': 'super' }],
                            [{ 'align': [] }],
                            [{ 'color': [] }, { 'background': [] }],
                            ['image']
                        ]
                    }
                }
            };
        },
        components: {
            quillEditor
        },
        created () {
            this.init();
            this.getGoodsType();
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
                    if (item.key === 'img') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            if (currentRowData.img) {
                                return h('img', {
                                    style: {
                                        width: '40px',
                                        height: '40px',
                                        cursor: 'pointer',
                                        'margin-top': '5px'
                                    },
                                    attrs: {
                                        src: currentRowData.img,
                                        shape: 'square',
                                        size: 'large'
                                    },
                                    on: {
                                        click: (e) => {
                                            this.formItem.img = currentRowData.img;
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
                    // 详情列
                    if (item.key === 'comment') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('div', [seeButton(vm, h, currentRowData, param.index)]);
                        };
                    }
                    // 状态列
                    if (item.key === 'recommend') {
                        item.render = (h, param) => {
                            let currentRowData = vm.tableData[param.index];
                            return h('i-switch', {
                                attrs: {
                                    size: 'large'
                                },
                                props: {
                                    'true-value': 1,
                                    'false-value': 0,
                                    value: currentRowData.recommend
                                },
                                on: {
                                    'on-change': function (recommend) {
                                        axios.get('GoodsCon/changeRecommend', {
                                            params: {
                                                recommend: recommend,
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
                                }, '推荐'),
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
                                        axios.get('GoodsCon/changeStatus', {
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
                this.uploadUrl = config.baseUrl + 'Index/upload';
                this.uploadHeader = {'ApiAuth': sessionStorage.getItem('apiAuth')};
            },
            // 获取商品类型数据
            getGoodsType () {
                let self = this;
                axios.get('Common/goodsTypeList').then(function (response) {
                    self.typeList = response.data.data;
                });
            },
            // 新增数据弹出框
            alertAdd () {
                this.getGoodsType();
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
                        let target = 'GoodsCon/aoe';
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
                axios.get('GoodsCon/index', {
                    params: {
                        page: vm.tableShow.currentPage,
                        size: vm.tableShow.pageSize,
                        type_id: vm.searchConf.type_id,
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
                this.formItem.img = '';
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
                    this.formItem.img = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            },
            // 富文本编辑器一系列
            onEditorBlur () {
            },
            onEditorFocus () {
            },
            onEditorChange () {
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
                    axios.get('GoodsCon/del', {
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
