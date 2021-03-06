import React from 'react';
import { withRouter } from 'react-router-dom';
import Button from 'antd/lib/button';
import Tooltip from 'antd/lib/tooltip';
import Carousel from 'antd/lib/carousel';
import { CarouselWrapper, SliderNavigation } from '../UI/ListAssetSlides/styledListAssetPage'
import * as Slides from '../UI/ListAssetSlides'
import { withCivic } from "../UI/CivicContainer";

class ListAssetPage extends React.Component {
    constructor(props) {
        super(props)
        this.next = this.next.bind(this)
        this.previous = this.previous.bind(this)
        this.goToSlide = this.goToSlide.bind(this)
        this.state = {
            currentSlide: 0,
            MYB_PLACEHOLDER: 0.18,
            maximumAllowedSlide: 1,
            data: {
                userCity: '',
                userCountry: '',
                category: '',
                asset: '',
                assetValue: 0,
                assetAddress1: '',
                assetAddress2: '',
                assetCity: '',
                assetCountry: '',
                assetProvince: '',
                assetPostalCode: '',
                fileList: [],
                managementFee: 0,
                collateralPercentage: 0,
                collateralMyb: 0,
                collateralDollar: 0
            }
        }
    }

    getCurrentSlide = () => {
        setTimeout(() => {
            let activeSlide = parseInt(
                document.getElementsByClassName('slick-current')[0]
                    .getAttribute('data-index')
            );
            this.setState({ currentSlide: activeSlide })
        }, 25);
    }

    next() {
        this.carousel.next();
        this.getCurrentSlide();
    }

    previous() {
        this.carousel.prev();
        this.getCurrentSlide();
    }

    goToSlide(number) {
        this.carousel.goTo(number, false);
        this.getCurrentSlide();
    }

    handleInputChange = (e) => {
        this.setState({
            data: { ...this.state.data,
                [e.target.name]: e.target.value }
        }, () => console.log(this.state));
    }

    handleSelectChange = (value, name) => {
        this.setState({
            data: { ...this.state.data,
                [name]: value }
        }, () => {
            if( name === 'userCountry') {
                this.setState({
                    data: { ...this.state.data,
                        assetCountry: value }
                }, () => console.log(this.state));
            }
        });
    }

    handleFileUpload = (filesObject) => {
        this.setState({
            data: { ...this.state.data,
                fileList: filesObject.fileList }
        }, () => console.log(this.state));
    }

    handleCollateralChange = (value, name) => {
        let percentage, dollar, myb;
        const { assetValue } = this.state.data;
        const { MYB_PLACEHOLDER } = this.state;
        switch(name) {
            case 'percentage':
                percentage = value;
                dollar = percentage/100 * assetValue;
                myb = dollar / MYB_PLACEHOLDER;
                break;
            case 'myb':
                myb = value;
                dollar = MYB_PLACEHOLDER * myb;
                percentage = parseInt(dollar/assetValue * 100);
                break;
            case 'dollar':
                dollar = value;
                myb = dollar / MYB_PLACEHOLDER;
                percentage = parseInt(dollar/assetValue * 100);
                break;
            default:
                console.log(this.state);
        }
        this.setState({
            data: { ...this.state.data,
                collateralDollar: dollar,
                collateralMyb: myb,
                collateralPercentage: percentage
             }
        }, () => console.log(this.state));
    }

    confirmAsset = () => {
      fetch('/api/list-asset/auth', {
        method: 'POST',
        body: this.state.data,
        headers: {
          Authorization: `Bearer ${this.props.civic.token}`,
        },
      }).then(res => res.json()).then(res => {
        this.props.history.push('/explore')
      }).catch((err) => {
        console.log(err);
      });
    }

    render() {
        const { currentSlide, MYB_PLACEHOLDER, data } = this.state;
        const { managementFee, collateralDollar, collateralMyb, collateralPercentage, assetValue } = this.state.data;
        return (
            <CarouselWrapper>
                <Carousel ref={node => this.carousel = node} infinite={false} effect="slide" dots={false} swipe={false} accessibility={false} >
                    <Slides.IntroSlide
                        next={this.next}
                        slidePosition={0}
                    />
                    <Slides.LocationSlide
                        next={this.next}
                        previous={this.previous}
                        handleSelectChange={this.handleSelectChange}
                        handleInputChange={this.handleInputChange}
                        formData={data}
                        slidePosition={1}
                        setMaximumAllowedSlide={this.setMaximumAllowedSlide}
                    />
                    <Slides.AvailableAssetsSlide
                        next={this.next}
                        previous={this.previous}
                        handleSelectChange={this.handleSelectChange}
                        handleInputChange={this.handleInputChange}
                        assetValue={typeof assetValue === 'string' ? 0 : assetValue}
                        formData={data}
                        history={this.props.history}
                    />
                    <Slides.AssetLocationSlide
                        next={this.next}
                        previous={this.previous}
                        handleSelectChange={this.handleSelectChange}
                        handleInputChange={this.handleInputChange}
                        formData={data}
                    />
                    <Slides.UploadSlide
                        next={this.next}
                        previous={this.previous}
                        handleFileUpload={this.handleFileUpload}
                        formData={data}
                    />
                    <Slides.FeeSlide
                        next={this.next}
                        previous={this.previous}
                        handleSelectChange={this.handleSelectChange}
                        managementFee={typeof managementFee === 'string' ? 0 : managementFee}
                        formData={data}
                    />
                    <Slides.CollateralSlide
                        next={this.next}
                        previous={this.previous}
                        handleCollateralChange={this.handleCollateralChange}
                        collateralDollar={typeof collateralDollar === 'string' ? 0 : collateralDollar}
                        collateralPercentage={collateralPercentage}
                        collateralMyb={typeof collateralMyb === 'string' ? 0 : collateralMyb}
                        constraints={{
                            max_percentage: 100,
                            min_myb: 0,
                            max_myb: assetValue / MYB_PLACEHOLDER,
                            min_dollars: 0,
                            max_dollars: assetValue
                        }}
                        formData={data}
                    />
                    <Slides.ConfirmAsset
                        next={this.next}
                        previous={this.previous}
                        confirmAsset={this.confirmAsset}
                        formData={data}
                    />
                </Carousel>

                <SliderNavigation>
                    {
                        SliderNavigationTooltips.map(slideTooltip => {
                            const buttonType = currentSlide === slideTooltip.slide ? "primary" : "secondary";
                            return (
                                <Tooltip title={slideTooltip.tooltip} key={`slideTooltip${slideTooltip.slide}`} >
                                    <Button
                                        type={buttonType}
                                        className="ListAsset-nav-button"
                                        shape="circle"
                                        disabled={slideTooltip.slide > currentSlide}
                                        onClick={() => this.goToSlide(slideTooltip.slide)}
                                    />
                                </Tooltip>
                            )
                        })
                    }
                </SliderNavigation>
            </CarouselWrapper>
        );
    }
}

const SliderNavigationTooltips = [
    { slide: 0, tooltip: "KYC" },
    { slide: 1, tooltip: "Location" },
    { slide: 2, tooltip: "Select Asset" },
    { slide: 3, tooltip: "Asset Location" },
    { slide: 4, tooltip: "Supporting Documents" },
    { slide: 5, tooltip: "Management Fee" },
    { slide: 6, tooltip: "Asset Collateral" },
    { slide: 7, tooltip: "Confirm Asset" }
]

export default withRouter(withCivic(ListAssetPage));
