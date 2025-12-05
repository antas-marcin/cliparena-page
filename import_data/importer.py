from datasets import load_dataset

import weaviate
from weaviate.classes.config import Configure
from weaviate.classes.config import Property, DataType
from weaviate.util import generate_uuid5
import time

DATASET_NAME="SamoXXX/MV-VDB-photos-small"
DATASET_SPLIT="sfw"
COLLECTION_NAME = "ClipArena"


def import_dataset(client: weaviate.WeaviateClient):
    print(f"Loading dataset: {DATASET_NAME} split: {DATASET_SPLIT}")

    dataset = load_dataset(DATASET_NAME, cache_dir="../.data/datasets", split=DATASET_SPLIT)

    print("Preparing dataset")

    weaviate_data = dataset.map(lambda x: {
        "index": x["index"],
        "base64_image": x["base64_image"],
        "dataset_name": x["dataset_name"],
        "split": DATASET_SPLIT,
    }).remove_columns(["image"])

    print("Connecting to Weaviate")

    client = weaviate.connect_to_local()

    print(f"Delete collection: {COLLECTION_NAME}")

    client.collections.delete(COLLECTION_NAME)

    print(f"Create collection: {COLLECTION_NAME}")

    collection = client.collections.create(
        name=COLLECTION_NAME,
        vector_config=[
            Configure.Vectors.multi2vec_clip(
                name="metaclip2",
                image_fields=["base64_image"],
                inference_url="http://192.168.0.67:8100",
                vector_index_config=Configure.VectorIndex.flat(),
                quantizer=Configure.VectorIndex.Quantizer.rq(bits=1),
            ),
            Configure.Vectors.multi2vec_clip(
                name="modernvbert",
                image_fields=["base64_image"],
                inference_url="http://192.168.0.67:8101",
                vector_index_config=Configure.VectorIndex.flat(),
                quantizer=Configure.VectorIndex.Quantizer.rq(bits=1),
            ),
            Configure.Vectors.multi2vec_clip(
                name="vitb32laion5b",
                image_fields=["base64_image"],
                inference_url="http://192.168.0.67:8102",
                vector_index_config=Configure.VectorIndex.flat(),
                quantizer=Configure.VectorIndex.Quantizer.rq(bits=1, ),
            ),
            Configure.Vectors.multi2vec_clip(
                name="siglip2",
                image_fields=["base64_image"],
                inference_url="http://192.168.0.67:8103",
                vector_index_config=Configure.VectorIndex.flat(),
                quantizer=Configure.VectorIndex.Quantizer.rq(bits=1, ),
            ),
        ],
        properties=[
            Property(name="dataset_name", data_type=DataType.TEXT),
            Property(name="base64_image", data_type=DataType.BLOB),
            Property(name="index", data_type=DataType.NUMBER),
        ]
    )

    print(f"Import data: {len(weaviate_data)}")

    start = time.time()

    collection = client.collections.use(COLLECTION_NAME)
    with collection.batch.fixed_size(batch_size=5, concurrent_requests=1) as batch:
        data_size = len(weaviate_data)
        for i, d in enumerate(weaviate_data):
            batch.add_object(properties=d, uuid=generate_uuid5(d["index"]))
            if i % 1000 == 0:
                print(f"Imported {len(collection)} / {data_size} objects")
        batch.flush()

    print(f"There are {len(collection.batch.failed_objects)} failed objects")
    print(f"Imported {len(weaviate_data)} objects in {(time.time() - start)/60:.3f} minutes")

    print("Aggregate data")

    aggregate = collection.aggregate.over_all()
    print(f"aggregate.total_count: {aggregate.total_count}")

    print("Success")


if __name__ == "__main__":
    with weaviate.connect_to_local() as client:
        import_dataset(client)
