<?php
namespace UserBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;
use Doctrine\Common\Persistence\ObjectManager;
use UserBundle\Entity\UserPhoto;

class UserPhotoToNumberTransformer implements DataTransformerInterface
{
    /**
     * @var ObjectManager
     */
    private $manager;

    public function __construct(ObjectManager $manager)
    {
        $this->manager = $manager;
    }

    /**
     * Transforms an object (UserPhoto) to an int (id).
     *
     * @param  int|string $userPhoto
     * 
     * @return int
     */
    public function transform($userPhoto)
    {
        if (null === $userPhoto) {
            return '';
        }

        return $userPhoto->getId();
    }

    /**
     * Transforms an int (id) to an object (UserPhoto).
     *
     * @param  int $id
     * 
     * @return UserPhoto|null
     * 
     * @throws TransformationFailedException if object (UserPhoto) is not found.
     */
    public function reverseTransform($id)
    {
        if (!$id) {
            return null;
        }

        $userPhoto = $this->manager
            ->getRepository('UserBundle:UserPhoto')
            ->find($id)
        ;

        if (null === $userPhoto) {
            throw new TransformationFailedException(sprintf(
                'UserPhoto with id "%s" not found',
                $id
            ));
        }

        return $userPhoto;
    }
}
