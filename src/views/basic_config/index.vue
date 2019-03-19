<style lang="less">
    @import 'index.less';
</style>

<template>
    <div>
        <Card>
            <p slot="title">
                <Icon type="md-person"></Icon>
                个人信息
            </p>
            <div>
                <Form ref="myForm" :rules="ruleValidate" :model="formItem" :label-width="100">
                    <FormItem label="商城banner图" prop="goods_banner">
                        <div class="demo-upload-list" v-if="formItem.goods_banner">
                            <img :src="formItem.goods_banner">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView()"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleImgRemove()"></Icon>
                            </div>
                        </div>
                        <input v-if="formItem.goods_banner" v-model="formItem.goods_banner" type="hidden" name="image">
                        <Upload type="drag"
                                :action="uploadUrl"
                                :headers="uploadHeader"
                                v-if="!formItem.goods_banner"
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
                            <img :src="formItem.goods_banner" v-if="visible" style="width: 100%">
                        </Modal>
                    </FormItem>
                    <div>
                        <!--<Button type="text" style="width: 100px;" @click="cancel">取消</Button>-->
                        <!--<Button type="primary" style="width: 100px; margin-left: 100px;" :loading="saveLoading" @click="confirmSubmit">保存</Button>-->
                        <Button type="primary" style="width: 100px; margin-left: 100px;" :loading="saveLoading" @click="submit">保存</Button>
                    </div>
                </Form>
            </div>
        </Card>
        <Modal v-model="confirmSub" width="360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="md-information-circle"></Icon>
                <span>确定要提交么</span>
            </p>
            <div style="text-align:center">
                <p>个人信息修改后，将会退出系统重新登录，请明确后修改！</p>
            </div>
            <div slot="footer">
                <Button type="error" size="large" long @click="submit">确定修改</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import config from '../../../build/config';
    import axios from 'axios';

    export default {
        name: 'basic_config_index',
        data () {
            return {
                // 保存加载状态
                saveLoading: false,
                // 初始化表单数据
                formItem: {},
                // 表单验证规则
                ruleValidate: {
                    goods_banner: [
                        { required: true, message: '请上传商城banner图', trigger: 'change' }
                    ]
                },
                // 编辑/添加弹窗中显示大图
                visible: false,
                // 上传地址
                uploadUrl: '',
                // 上传头部信息
                uploadHeader: {}
            };
        },
        created () {
            this.init();
        },
        methods: {
            // 初始化页面
            init () {
                this.uploadUrl = config.baseUrl + 'Index/upload';
                this.uploadHeader = {'ApiAuth': sessionStorage.getItem('apiAuth')};
                this.getBasicConfig();
            },
            // 获取基本配置数据
            getBasicConfig () {
                let self = this;
                axios.get('BasicConfigCon/index').then(function (response) {
                    self.formItem = response.data.data;
                });
            },
            // 表单提交
            submit () {
                let self = this;
                this.$refs['myForm'].validate((valid) => {
                    if (valid) {
                        self.saveLoading = true;
                        axios.post('BasicConfigCon/edit', self.formItem).then(function (response) {
                            if (response.data.code === 1) {
                                self.$Message.success(response.data.msg);
                            } else {
                                if (response.data.code === -14) {
                                    self.$store.commit('logout', self);
                                    self.$router.push({
                                        name: 'login'
                                    });
                                } else {
                                    self.$Message.error(response.data.msg);
                                }
                            }
                            self.saveLoading = false;
                        });
                    }
                });
            },
            // 上传图片一系列
            handleView () {
                this.visible = true;
            },
            handleImgRemove () {
                this.formItem.goods_banner = '';
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
                    this.formItem.goods_banner = response.data.fileUrl;
                } else {
                    this.$Message.error(response.msg);
                }
            }
        }
    };
</script>
